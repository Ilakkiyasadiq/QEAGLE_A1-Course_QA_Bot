-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    doc_id SERIAL PRIMARY KEY,
    title TEXT,
    metadata JSONB
);

-- Chunks table
CREATE TABLE IF NOT EXISTS chunks (
    chunk_id SERIAL PRIMARY KEY,
    doc_id INT REFERENCES documents(doc_id),
    page_num INT,
    text TEXT,
    embedding VECTOR(768),
    metadata JSONB
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id SERIAL PRIMARY KEY,
    query TEXT,
    answer_id TEXT,
    label TEXT CHECK (label IN ('good','bad')),
    note TEXT,
    created_at TIMESTAMP DEFAULT now()
);
