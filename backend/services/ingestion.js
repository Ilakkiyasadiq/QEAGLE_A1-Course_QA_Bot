import fs from "fs/promises";
import path from "path";
import pool from "../db/db.js";
import { embedText, getEmbeddingDim } from "../utils/embeddings.js";

// Simple character-based chunker with overlap
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(text.length, i + chunkSize);
    const chunk = text.slice(i, end);
    chunks.push(chunk);
    if (end === text.length) break;
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return chunks;
}

export async function ingestTextDocument(title, text, options = {}) {
  const { chunkSize = 1000, overlap = 200, page_num = null } = options;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const docRes = await client.query(
      "INSERT INTO documents (title, metadata) VALUES ($1, $2) RETURNING doc_id",
      [title, { source: "ingest" }]
    );
    const doc_id = docRes.rows[0].doc_id;

    const chunks = chunkText(text, chunkSize, overlap);
    const dim = getEmbeddingDim();

    for (let idx = 0; idx < chunks.length; idx++) {
      const c = chunks[idx];
      const embedding = await embedText(c);
      if (!Array.isArray(embedding) || embedding.length !== dim) {
        throw new Error(`Embedding dimension mismatch. Expected ${dim}, got ${embedding?.length}`);
      }
      // Pass embedding as a vector literal that Postgres will cast to the vector type
      const embeddingLiteral = `[${embedding.join(",")}]`;
      await client.query(
        "INSERT INTO chunks (doc_id, page_num, text, embedding, metadata) VALUES ($1, $2, $3, $4, $5)",
        [
          doc_id,
          page_num ?? idx + 1,
          c,
          embeddingLiteral, // vector literal, e.g. "[0.1,0.2,...]"
          { idx }
        ]
      );
    }

    await client.query("COMMIT");
    return { doc_id, chunks_inserted: chunks.length };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function ingestFile(filePath, title, options = {}) {
  const abs = path.resolve(filePath);
  const content = await fs.readFile(abs, "utf8");
  return ingestTextDocument(title ?? path.basename(abs), content, options);
}
