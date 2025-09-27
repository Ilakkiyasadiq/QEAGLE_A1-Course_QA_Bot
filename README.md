Got it 👍 — let’s make it **clean, professional, mentor-friendly** without emojis.
Here’s the revised, structured version of your document:

---

# Course Q&A Chatbot (RAG + Citations)

A **Retrieval-Augmented Generation (RAG)** based chatbot that answers course-related questions with direct citations from uploaded documents.
The system ensures accurate, trustworthy responses by combining vector search with hybrid retrieval techniques.

---

## Features

* Upload course PDFs and query them directly
* Retrieval-Augmented Generation (RAG) with citations
* Multiple retrieval modes: Vector, Hybrid
* Evaluation metrics: Recall@5, Faithfulness, Latency

---

## Tech Stack

* **Frontend:** React.js (Vite)
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL with pgvector extension
* **LLM Integration:** Ollama / openAI

---

## Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/Ilakkiyasadiq/A1-Course_QA_Bot-.git
cd A1-Course_QA_Bot-
```

### 2. Install Dependencies

**Frontend**

```bash
cd frontend
npm install
```

**Backend**

```bash
cd ../backend
npm install
```

### 3. PostgreSQL + pgVector Setup

Enable extension:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Environment Configuration

**Backend (.env)**

```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
TRANSLATION_API_KEY=your_translation_key
PORT=3000
```

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Run the Project

**Backend**

```bash
cd backend
npm start
```

**Frontend**

```bash
cd frontend
npm run dev
```

Visit: `http://localhost:5173`

---

## Usage

1. Upload a course PDF through the web interface
2. Ask questions in natural language
3. Get accurate answers with citations like `[S1:p2]`
4. Click citations to view the original source material

---

## Architecture Diagram

### System Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Node.js/Express │    │  PostgreSQL +   │
│                 │    │     Backend      │    │    pgVector     │
│  - Chat UI      │◄──►│  - API Routes    │◄──►│  - Vector Store │
│  - Source Viewer│    │  - RAG Pipeline  │    │  - Document     │
│  - File Upload  │    │  - Hybrid Search │    │    Metadata     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        ▼                        │
         │              ┌──────────────────┐               │
         │              │   External APIs  │               │
         └──────────────│  - OpenAI (LLM)  │◄──────────────┘
                        │  - Embeddings    │
                        │  - Translation   │
                        └──────────────────┘
```

---

## RAG Pipeline Flow

1. **Document Ingestion** → PDF upload → Text extraction → Semantic chunking → Embedding generation → Vector storage
2. **Query Processing** → User question → Translation → Hybrid search (BM25 + Vector) → Re-ranking → Top-k retrieval
3. **Answer Generation** → Retrieved chunks + Question → LLM prompting → Citation extraction → Response formatting
4. **Response Delivery** → Answer + Citations → Translation (if needed) → UI display with source viewer

---

## Technology Stack Highlights

### Frontend Layer

* React.js - Component-based UI
* Vite - Fast build tooling
* Real-time chat interface
* Source viewer with citation pane

### Backend Layer

* Node.js + Express REST API server
* RAG pipeline with hybrid retrieval and generation
* Multilingual translation middleware
* Safety filters for injection protection

### Data Layer

* PostgreSQL relational database
* pgVector for vector similarity search
* BM25 keyword search integration
* Hybrid indexing with rank fusion

### AI/ML Services

* OpenAI GPT-4 for answer generation
* Embedding models for semantic similarity
* Cross-encoder for re-ranking
* Translation API for multilingual support

---

## Key Architectural Decisions

* **Hybrid Search Strategy**: pgVector for semantic similarity, BM25 for keyword matching, Reciprocal Rank Fusion for balance, Cross-encoder for re-ranking
* **PostgreSQL + pgVector**: unified database for vectors and metadata, ACID compliance, production reliability
* **Node.js Backend**: async-friendly, full-stack JavaScript, rapid prototyping

---

## Project Structure

```
A1-Course_QA_Bot-/
├── frontend/                 # React.js UI
│   ├── components/           # Chat, Uploader, Viewer
│   ├── services/             # API clients
│   └── App.jsx
│
├── backend/                  # Node.js API
│   ├── routes/               # /answer, /source, /feedback
│   ├── models/               # RAG pipeline, embeddings
│   ├── db/                   # Queries & schema
│   └── server.js
│
├── db/                       # Database schema
│   ├── schema.sql
│   └── migrations/
│
├── evaluation/               # Performance metrics
│   ├── evaluate.py
│   └── gold_qa.json
│
└── docs/                     # Documentation
    ├── architecture.png
    ├── one-pager.pdf
    └── sample-data/
```

---
