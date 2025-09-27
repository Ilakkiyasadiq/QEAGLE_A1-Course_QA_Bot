import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import answerRoutes from "./routes/answerRoutes.js";   // ✅ keep this one
import sourceRoutes from "./routes/source.js";
import feedbackRoutes from "./routes/feedback.js";
import ingestRoutes from "./routes/ingest.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use("/answer", answerRoutes);
app.use("/source", sourceRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/ingest", ingestRoutes);
app.use("/admin", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("✅ Course Q&A Bot API is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
