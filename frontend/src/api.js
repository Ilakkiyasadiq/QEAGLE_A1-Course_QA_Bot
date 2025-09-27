const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export async function askAnswer({ query, lang = 'en', top_k = 5 }) {
  const resp = await fetch(`${API_BASE}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, lang, top_k })
  })
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`API error ${resp.status}: ${text}`)
  }
  return resp.json()
}

export async function fetchSource(id) {
  const resp = await fetch(`${API_BASE}/source/${id}`)
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`API error ${resp.status}: ${text}`)
  }
  return resp.json()
}

export async function ingestUpload({ file, title, chunkSize, overlap }) {
  const fd = new FormData()
  fd.append('file', file)
  if (title) fd.append('title', title)
  if (Number.isFinite(chunkSize)) fd.append('chunkSize', String(chunkSize))
  if (Number.isFinite(overlap)) fd.append('overlap', String(overlap))

  const resp = await fetch(`${API_BASE}/ingest`, {
    method: 'POST',
    body: fd
  })
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`API error ${resp.status}: ${text}`)
  }
  return resp.json()
}

export async function clearAll() {
  const resp = await fetch(`${API_BASE}/admin/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: 'DELETE' })
  })
  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`API error ${resp.status}: ${text}`)
  }
  return resp.json()
}
