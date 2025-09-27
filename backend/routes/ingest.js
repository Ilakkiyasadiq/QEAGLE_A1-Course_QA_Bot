import express from "express";
import multer from "multer";
import { ingestTextDocument } from "../services/ingestion.js";

const upload = multer({}); // in-memory storage
const router = express.Router();

// POST /ingest
// multipart/form-data with fields:
// - file: uploaded text/markdown file
// - title: optional title (defaults to filename)
// - chunkSize: optional integer
// - overlap: optional integer
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file is required" });

    const title = req.body.title?.toString()?.trim() || (req.file.originalname || "Untitled");
    const chunkSize = req.body.chunkSize ? Number(req.body.chunkSize) : undefined;
    const overlap = req.body.overlap ? Number(req.body.overlap) : undefined;

    const text = req.file.buffer.toString("utf8");
    const options = {};
    if (Number.isFinite(chunkSize)) options.chunkSize = chunkSize;
    if (Number.isFinite(overlap)) options.overlap = overlap;

    const result = await ingestTextDocument(title, text, options);
    res.json({
      status: "ok",
      doc_id: result.doc_id,
      chunks_inserted: result.chunks_inserted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to ingest" });
  }
});

export default router;
