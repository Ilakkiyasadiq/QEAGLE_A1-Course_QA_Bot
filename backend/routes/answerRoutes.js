import express from "express";
import { getAnswer } from "../services/answerService.js";

const router = express.Router();

// POST /answer
router.post("/", async (req, res) => {
  try {
    const { query, lang, top_k } = req.body;
    const response = await getAnswer(query, lang, top_k);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
