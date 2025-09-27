import express from "express";
import pool from "../db/db.js";
const router = express.Router();

// GET /source/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT chunk_id, doc_id, page_num, text, metadata FROM chunks WHERE chunk_id = $1",
      [Number(id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    const row = result.rows[0];
    res.json({
      source_id: row.chunk_id,
      doc_id: row.doc_id,
      page_num: row.page_num,
      text: row.text,
      metadata: row.metadata
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
