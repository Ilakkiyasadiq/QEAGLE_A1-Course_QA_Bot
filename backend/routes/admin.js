import express from "express";
import pool from "../db/db.js";

const router = express.Router();

// POST /admin/clear
// Body: { "confirm": "DELETE" }
// Truncates all documents and chunks, resetting ids.
router.post("/clear", async (req, res) => {
  try {
    const { confirm } = req.body || {};
    if (confirm !== "DELETE") {
      return res.status(400).json({ error: "Confirmation required. Send { \"confirm\": \"DELETE\" }" });
    }
    await pool.query("TRUNCATE TABLE chunks, documents RESTART IDENTITY CASCADE;");
    return res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to clear data" });
  }
});

export default router;
