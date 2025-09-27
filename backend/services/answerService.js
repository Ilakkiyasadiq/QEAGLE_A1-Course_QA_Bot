import { retrieveChunks } from "./retrieval.js";
import { composeAnswer } from "./composer.js";
import { translate } from "../utils/translate.js";

export async function getAnswer(query, lang = "en", top_k = 5) {
  const t0 = Date.now();

  // Retrieve candidate chunks
  const chunks = await retrieveChunks(query, top_k);

  // If retrieval confidence is too low, refuse gracefully
  const MIN_RELEVANCE = Number(process.env.MIN_RELEVANCE_SCORE || 0.35);
  const topScore = chunks?.[0]?.score ?? 0;
  if (!chunks.length || !(topScore >= MIN_RELEVANCE)) {
    const latency_ms = Date.now() - t0;
    return {
      answer: "I don't have enough information in the current knowledge base to answer that. Please ingest relevant sources or rephrase your question.",
      citations: [],
      usage: { tokens: 0 },
      latency_ms
    };
  }

  // Compose with LLM (or extractive fallback)
  const composed = await composeAnswer(chunks, query);
  const translated = await translate(composed.answer, lang);
  const latency_ms = Date.now() - t0;

  const CITATION_SPAN_LEN = Number(process.env.CITATION_SPAN_LEN || 160);
  return {
    answer: translated,
    citations: chunks.map(c => ({ source_id: c.id, span: c.text.slice(0, CITATION_SPAN_LEN), score: c.score })),
    usage: { tokens: 0 },
    latency_ms
  };
}
