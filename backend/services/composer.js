import fetch from "node-fetch";

const COMPOSER_PROVIDER = (process.env.COMPOSER_PROVIDER || "extractive").toLowerCase();
const OLLAMA_LLM_URL = process.env.OLLAMA_LLM_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_LLM_MODEL = process.env.OLLAMA_LLM_MODEL || "llama3.2:3b-instruct"; // lightweight

export async function composeAnswer(chunks, query) {
  if (COMPOSER_PROVIDER === "ollama") {
    return composeWithOllama(chunks, query);
  }
  // Fallback: simple extractive composition
  const SNIPPET_LEN = Number(process.env.ANSWER_SNIPPET_LEN || 800);
  const snippet = chunks.map((c, i) => (`(${i+1}) ${c.text}`).slice(0, SNIPPET_LEN)).join("\n\n");
  const answer = `Here is what I found for your query: "${query}"\n\n${snippet}`;
  const CITATION_SPAN_LEN = Number(process.env.CITATION_SPAN_LEN || 160);
  const citations = chunks.map(c => ({ source_id: c.id, span: c.text.slice(0, CITATION_SPAN_LEN) }));
  return { answer, citations };
}

async function composeWithOllama(chunks, query) {
  const MAX_CONTEXT_CHARS = Number(process.env.OLLAMA_CONTEXT_CHARS || 5000);
  const SNIPPET_LEN = Math.max(200, Math.floor(MAX_CONTEXT_CHARS / Math.max(1, chunks.length)));
  const context = chunks.map(c => {
    const header = `Source #${c.id}${c.doc_id ? ` (doc ${c.doc_id}${c.page_num ? `, page ${c.page_num}` : ``})` : ""}`;
    return `${header}:\n${(c.text || "").slice(0, SNIPPET_LEN)}`;
  }).join("\n\n");

  const system = `You are a helpful assistant that answers questions using only the provided context.\n- If the context is insufficient, say you don't have enough information.\n- Be concise and coherent.\n- Do not fabricate details.\n- After the answer, include a brief 'Sources: #id, #id' line listing the source_ids you used.`;

  const prompt = `${system}\n\nQuestion: ${query}\n\nContext:\n${context}\n\nAnswer:`;

  const body = {
    model: OLLAMA_LLM_MODEL,
    prompt,
    stream: false,
    options: {
      temperature: Number(process.env.OLLAMA_LLM_TEMPERATURE || 0.2),
      top_p: Number(process.env.OLLAMA_LLM_TOP_P || 0.9)
    }
  };

  const resp = await fetch(`${OLLAMA_LLM_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Ollama LLM error: ${resp.status} ${resp.statusText} - ${text}`);
  }
  const data = await resp.json(); // { response: string, ... }
  const answer = data?.response || "";

  const CITATION_SPAN_LEN = Number(process.env.CITATION_SPAN_LEN || 160);
  const citations = chunks.map(c => ({ source_id: c.id, span: (c.text || "").slice(0, CITATION_SPAN_LEN) }));
  return { answer, citations };
}
