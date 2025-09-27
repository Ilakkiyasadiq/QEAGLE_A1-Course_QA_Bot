import pool from "../db/db.js";
import { embedText } from "../utils/embeddings.js";

export async function retrieveChunks(query, top_k = 5) {
  // Vector search using pgvector: smaller distance is better
  const qvec = await embedText(query);
  const qvecLiteral = `[${qvec.join(",")}]`;
  const res = await pool.query(
    `SELECT chunk_id, doc_id, page_num, text, metadata, (embedding <-> $1::vector) AS distance
     FROM chunks
     ORDER BY embedding <-> $1::vector
     LIMIT $2`,
    [qvecLiteral, top_k]
  );

  return res.rows.map(r => ({
    id: r.chunk_id,
    doc_id: r.doc_id,
    page_num: r.page_num,
    text: r.text,
    metadata: r.metadata,
    score: 1 / (1 + r.distance) // convert distance to a [0,1)-ish score
  }));
}
