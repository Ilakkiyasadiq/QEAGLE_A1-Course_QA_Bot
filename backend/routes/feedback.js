import express from "express";
import pool from "../db/db.js";
const router = express.Router();

// POST /feedback
router.post("/", async (req, res) => {
  try {
    const { query, answer_id, label, note } = req.body;
    if (!query || !label) return res.status(400).json({ error: "query and label are required" });
    await pool.query(
      `INSERT INTO feedback (query, answer_id, label, note) VALUES ($1, $2, $3, $4)`,
      [query, answer_id ?? null, label, note ?? null]
    );
    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
