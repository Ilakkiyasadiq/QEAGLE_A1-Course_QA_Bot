import dotenv from "dotenv";
import fetch from "node-fetch";

// Embedding providers supported:
// - dummy: deterministic pseudo-embeddings with EMBEDDINGS_DIM (default 768)
// - hf: Hugging Face Inference API with EMBEDDINGS_MODEL (default intfloat/multilingual-e5-base)
// - ollama: local embeddings via Ollama (default nomic-embed-text, 768 dims)

dotenv.config();

const PROVIDER = process.env.EMBEDDINGS_PROVIDER?.toLowerCase() || "dummy";
const DIM = Number(process.env.EMBEDDINGS_DIM || 768);

// Ollama config
const OLLAMA_URL = process.env.OLLAMA_EMBED_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

export function getEmbeddingDim() {
  return DIM;
}

export async function embedText(text) {
  if (!text || !text.trim()) return Array(DIM).fill(0);

  if (PROVIDER === "ollama") {
    const resp = await fetch(`${OLLAMA_URL}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt: text })
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      throw new Error(`Ollama embeddings error: ${resp.status} ${resp.statusText} - ${body}`);
    }
    const data = await resp.json(); // { embedding: number[] }
    const vec = data?.embedding;
    if (!Array.isArray(vec) || vec.length !== DIM) {
      throw new Error(`Embedding dimension mismatch from Ollama: expected ${DIM}, got ${vec?.length}`);
    }
    return vec;
  }

  if (PROVIDER === "hf") {
    const model = process.env.EMBEDDINGS_MODEL || "intfloat/multilingual-e5-base"; // 768 dims
    const token = process.env.HF_API_TOKEN;
    if (!token) throw new Error("HF_API_TOKEN is required for hf provider");

    const url = `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text, options: { wait_for_model: true } })
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      throw new Error(`HF embeddings error: ${resp.status} ${resp.statusText} - ${body}`);
    }
    const data = await resp.json();
    // Expect a 2D or 1D array
    const vec = Array.isArray(data[0]) ? data[0] : data;
    if (vec.length !== DIM) {
      throw new Error(`Embedding dimension mismatch from provider: expected ${DIM}, got ${vec.length}`);
    }
    return vec;
  }

  // Default: dummy deterministic embedding (no external calls)
  return pseudoEmbedding(text, DIM);
}

function pseudoEmbedding(text, dim) {
  // Simple deterministic hash-based pseudo embedding
  let h1 = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h1 ^= text.charCodeAt(i);
    h1 = Math.imul(h1, 16777619) >>> 0;
  }
  // xorshift32
  let x = (h1 || 1) >>> 0;
  const out = new Array(dim);
  for (let i = 0; i < dim; i++) {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17; x >>>= 0;
    x ^= x << 5;  x >>>= 0;
    // map to [-1, 1]
    out[i] = (x / 0xffffffff) * 2 - 1;
  }
  // L2 normalize
  let norm = Math.sqrt(out.reduce((s, v) => s + v * v, 0)) || 1;
  for (let i = 0; i < dim; i++) out[i] = out[i] / norm;
  return out;
}
