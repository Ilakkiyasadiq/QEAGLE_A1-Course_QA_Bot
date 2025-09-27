import React, { useState } from 'react'
import { askAnswer, fetchSource, ingestUpload } from './api'

export default function App() {
  const [query, setQuery] = useState('')
  const [lang, setLang] = useState('en')
  const [topK, setTopK] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resp, setResp] = useState(null)
  const [sources, setSources] = useState({})
  const [ingFile, setIngFile] = useState(null)
  const [ingTitle, setIngTitle] = useState('')
  const [ingChunk, setIngChunk] = useState(1200)
  const [ingOverlap, setIngOverlap] = useState(200)
  const [ingLoading, setIngLoading] = useState(false)
  const [ingMsg, setIngMsg] = useState('')
  const [isIngested, setIsIngested] = useState(false)

  async function onAsk(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResp(null)
    try {
      const data = await askAnswer({ query, lang, top_k: Number(topK) || 5 })
      setResp(data)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function onShowSource(id) {
    try {
      if (!sources[id]) {
        const s = await fetchSource(id)
        setSources(prev => ({ ...prev, [id]: s }))
      }
    } catch (err) {
      alert(`Failed to load source ${id}: ${err.message}`)
    }
  }

  async function onIngest(e) {
    e.preventDefault()
    setIngMsg('')
    if (!ingFile) {
      setIngMsg('Please choose a file to upload')
      return
    }
    try {
      setIngLoading(true)
      const data = await ingestUpload({ file: ingFile, title: ingTitle, chunkSize: Number(ingChunk), overlap: Number(ingOverlap) })
      setIngMsg(`Ingested doc_id=${data.doc_id}, chunks=${data.chunks_inserted}`)
      setIsIngested(true)
    } catch (err) {
      setIngMsg(`Failed: ${err.message}`)
      setIsIngested(false)
    } finally {
      setIngLoading(false)
    }
  }

  function clearAnswer() {
    setResp(null)
    setError(null)
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
  }

  async function handleDeleteAll() {
    const ok = window.confirm('This will delete ALL documents and chunks. Continue?')
    if (!ok) return
    const typed = window.prompt('Type DELETE to confirm:')
    if (typed !== 'DELETE') {
      alert('Aborted: confirmation mismatch')
      return
    }
    try {
      const { clearAll } = await import('./api')
      await clearAll()
      setResp(null)
      setQuery('')
      setIsIngested(false)
      setIngMsg('')
      setIngFile(null)
      setIngTitle('')
      alert('All data cleared')
    } catch (err) {
      alert(`Failed: ${err.message}`)
    }
  }

  return (
    <div style={styles.bg}>
      {/* Delete All Button */}
      <button onClick={handleDeleteAll} style={styles.deleteBtn}>
        <img src="https://img.icons8.com/ios-glyphs/30/fa314a/delete-sign.png" alt="Delete" style={{ width: 22, marginRight: 6, verticalAlign: 'middle' }} />
        Delete All
      </button>
      <div style={styles.centeredContainer}>
        <div style={styles.header}>
          <img src="https://img.icons8.com/ios-filled/50/0078d4/faq.png" alt="Bot Logo" style={{ width: 40, verticalAlign: 'middle', marginRight: 10 }} />
          <span style={styles.title}>Course Q&amp;A Bot</span>
        </div>
        <p style={styles.subtitle}>
          Upload your course material and ask questions. Get instant, document-based answers!
        </p>
        <div style={styles.flexRowBoxes}>
          {/* Upload Card */}
          <div style={styles.card}>
            <div style={styles.boxIcon}>
              <img src="https://img.icons8.com/ios-filled/50/0078d4/upload.png" alt="Upload" width={36} />
            </div>
            <h2 style={styles.sectionTitle}>Upload</h2>
            <form onSubmit={onIngest} style={styles.formGrid}>
              <label style={styles.label}>
                File
                <input type="file" accept=".txt,.md,.markdown,.csv" onChange={e => setIngFile(e.target.files?.[0] || null)} style={styles.input} />
              </label>
              <label style={styles.label}>
                Title (optional)
                <input value={ingTitle} onChange={e => setIngTitle(e.target.value)} placeholder="Document title" style={styles.input} />
              </label>
              <div style={styles.flexRow}>
                <label style={styles.label}>
                  Chunk size
                  <input type="number" min="200" max="4000" value={ingChunk} onChange={e => setIngChunk(e.target.value)} style={styles.input} />
                </label>
                <label style={styles.label}>
                  Overlap
                  <input type="number" min="0" max="1000" value={ingOverlap} onChange={e => setIngOverlap(e.target.value)} style={styles.input} />
                </label>
              </div>
              <button type="submit" disabled={ingLoading} style={styles.button}>
                {ingLoading ? 'Ingesting…' : 'Ingest'}
              </button>
            </form>
            {ingMsg && <div style={styles.ingMsg}>{ingMsg}</div>}
            {ingLoading && (
              <div style={{ width: '100%', background: '#e1e4e8', borderRadius: 4, margin: '8px 0' }}>
                <div style={{ width: '100%', height: 6, background: '#0078d4', borderRadius: 4, animation: 'progress 1.2s linear infinite' }} />
              </div>
            )}
          </div>
          {/* Ask Card */}
          <div style={styles.card}>
            <div style={styles.boxIcon}>
              <img src="https://img.icons8.com/ios-filled/50/0078d4/help.png" alt="Ask" width={36} />
            </div>
            <h2 style={styles.sectionTitle}>Ask</h2>
            <form onSubmit={onAsk} style={styles.formGrid}>
              <label style={styles.label}>
                Question
                <textarea
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  rows={3}
                  style={styles.textarea}
                  placeholder="Type your question here…"
                  disabled={!isIngested}
                />
              </label>
              <div style={styles.flexRow}>
                <label style={styles.label}>
                  Language
                  <select value={lang} onChange={e => setLang(e.target.value)} style={styles.input}>
                    <option value="en">English</option>
                  </select>
                </label>
                <label style={styles.label}>
                  Top K
                  <input type="number" min="1" max="10" value={topK} onChange={e => setTopK(e.target.value)} style={styles.input} />
                </label>
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim() || !isIngested}
                style={styles.button}
              >
                {loading ? 'Asking…' : 'Ask'}
              </button>
              <button type="button" onClick={clearAnswer} style={styles.smallButton}>
                Clear Answer
              </button>
            </form>
            {!isIngested && (
              <div style={{ color: 'crimson', marginTop: 8 }}>
                Please ingest a file before asking questions.
              </div>
            )}
            {error && (
              <div style={styles.error}>
                Error: {error}
              </div>
            )}
          </div>
          {/* Answer Card */}
          <div style={styles.card}>
            <div style={styles.boxIcon}>
              <img src="https://img.icons8.com/ios-filled/50/0078d4/idea.png" alt="Answer" width={36} />
            </div>
            <h2 style={styles.sectionTitle}>Answer</h2>
            {resp ? (
              <>
                <pre style={styles.answer}>{resp.answer}</pre>
                <button
                  style={styles.smallButton}
                  onClick={() => copyToClipboard(resp.answer)}
                >
                  Copy Answer
                </button>
                {resp.citations?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <h3 style={styles.citationTitle}>Citations</h3>
                    <ul style={styles.citationList}>
                      {resp.citations.map((c, i) => (
                        <li key={`${c.source_id}-${i}`} style={styles.citationItem}>
                          <div>
                            <strong>Source #{c.source_id}</strong> — score: {c.score?.toFixed?.(4) ?? 'n/a'}
                          </div>
                          <div style={styles.citationSpan}>{c.span}</div>
                          <button onClick={() => onShowSource(c.source_id)} style={styles.smallButton}>Show full chunk</button>
                          {sources[c.source_id] && (
                            <pre style={styles.chunkText}>
                              {sources[c.source_id].text}
                            </pre>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: '#888', marginTop: 12 }}>No answer yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  bg: {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(120deg, #e0e7ff 0%, #f6f8fa 100%)',
    fontFamily: 'system-ui, Arial, sans-serif',
    position: 'relative',
  },
  deleteBtn: {
    position: 'fixed',
    top: 24,
    right: 36,
    zIndex: 10,
    background: '#fff',
    color: '#c00',
    border: '1.5px solid #fa314a',
    borderRadius: 6,
    padding: '8px 18px',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(250,49,74,0.08)',
    transition: 'background 0.2s',
  },
  centeredContainer: {
    maxWidth: 1200,
    margin: '40px auto 0 auto',
    padding: '0 16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 36,
    marginBottom: 8,
    color: '#222',
    letterSpacing: '-1px',
  },
  title: {
    fontSize: 36,
    fontWeight: 800,
    color: '#222',
    letterSpacing: '-1px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    fontSize: 18,
    marginBottom: 24,
    marginTop: 0,
  },
  flexRowBoxes: {
    display: 'flex',
    gap: 32,
    justifyContent: 'center',
    margin: '32px 0',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 12px rgba(0,120,212,0.06)',
    padding: 32,
    minWidth: 280,
    maxWidth: 340,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  boxIcon: {
    marginBottom: 8,
  },
  sectionTitle: {
    margin: '0 0 18px 0',
    fontSize: 24,
    color: '#0078d4',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
  formGrid: {
    display: 'grid',
    gap: 14,
    width: '100%',
  },
  label: {
    fontWeight: 500,
    color: '#333',
    marginBottom: 4,
    display: 'block',
    fontSize: 15,
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: 15,
    marginTop: 4,
    background: '#f7fafc',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: 15,
    marginTop: 4,
    resize: 'vertical',
    background: '#f7fafc',
  },
  flexRow: {
    display: 'flex',
    gap: 12,
  },
  button: {
    padding: '12px 24px',
    borderRadius: 6,
    border: 'none',
    background: 'linear-gradient(90deg, #0078d4 0%, #005fa3 100%)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 17,
    cursor: 'pointer',
    marginTop: 8,
    boxShadow: '0 2px 8px rgba(0,120,212,0.08)',
    transition: 'background 0.2s',
  },
  smallButton: {
    padding: '6px 14px',
    borderRadius: 4,
    border: 'none',
    background: '#e1e4e8',
    color: '#333',
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 8,
    marginRight: 6,
  },
  ingMsg: {
    marginTop: 8,
    color: '#0078d4',
    fontWeight: 500,
  },
  error: {
    color: 'crimson',
    marginTop: 12,
    fontWeight: 500,
  },
  answer: {
    whiteSpace: 'pre-wrap',
    background: '#fff',
    padding: 14,
    borderRadius: 8,
    border: '1px solid #e1e4e8',
    fontSize: 16,
    marginTop: 8,
    fontFamily: 'inherit',
    color: '#222',
    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
  },
  citationTitle: {
    marginBottom: 8,
    color: '#2d3a4b',
    fontSize: 17,
  },
  citationList: {
    listStyle: 'none',
    padding: 0,
  },
  citationItem: {
    marginBottom: 16,
    background: '#f9fafb',
    borderRadius: 6,
    padding: 10,
    border: '1px solid #e1e4e8',
  },
  citationSpan: {
    fontFamily: 'monospace',
    fontSize: 14,
    marginTop: 4,
    color: '#444',
  },
  chunkText: {
    whiteSpace: 'pre-wrap',
    background: '#f6f6f6',
    padding: 8,
    marginTop: 6,
    borderRadius: 6,
    fontSize: 14,
  },
}
