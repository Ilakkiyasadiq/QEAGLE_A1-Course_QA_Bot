# Course Q&A Chatbot (RAG + Citations)

A Retrieval-Augmented Generation (RAG) based chatbot that answers course-related questions with direct citations from uploaded documents. The system ensures accurate, trustworthy responses by combining vector search with hybrid retrieval techniques.

---

## Features
- Upload course PDFs and query them directly.
- Retrieval-Augmented Generation (RAG) with citations.
- Multiple retrieval modes: Vector, Hybrid.
- Evaluation metrics for Recall@5, Faithfulness, and Latency.

---

## Tech Stack
- **Frontend:** React.js (Vite)  
- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL with pgvector extension  
- **LLM Integration:** Ollama / OpenAI API  

---

## 🛠️ Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/Ilakkiyasadiq/A1-Course_QA_Bot-.git
cd A1-Course_QA_Bot-
2. Install Dependencies
Frontend:

bash
cd frontend
npm install
Backend:

bash
cd ../backend
npm install
3. PostgreSQL + pgVector Setup
Enable pgvector extension in your PostgreSQL database:

sql
CREATE EXTENSION IF NOT EXISTS vector;
4. Environment Configuration
Create .env files from the examples:

Backend (.env):

env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
TRANSLATION_API_KEY=your_translation_key
PORT=3000
Frontend (.env):

env
VITE_API_URL=http://localhost:3000/api
🚀 Run the Project
Start Backend (Node.js + Express):

bash
cd backend
npm start
Start Frontend (React + Vite):

bash
cd frontend
npm run dev
Visit http://localhost:5173 to access the application!

💡 Usage
Upload a course PDF through the web interface

Ask questions in natural language (English or supported Indian languages)

Get accurate answers with supporting citations [S1:p2]

Click citations to view original source material

🏗️ Architecture Diagram
System Overview
text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Node.js/Express │    │  PostgreSQL +   │
│                 │    │     Backend      │    │    pgVector     │
│  - Chat UI      │◄──►│  - API Routes    │◄──►│  - Vector Store │
│  - Source Viewer│    │  - RAG Pipeline  │    │  - Document     │
│  - File Upload  │    │  - Hybrid Search │    │    Metadata     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         │                        ▼                        │
         │              ┌──────────────────┐               │
         │              │   External APIs  │               │
         └──────────────│  - OpenAI (LLM)  │◄──────────────┘
                        │  - Embeddings    │
                        │  - Translation   │
                        └──────────────────┘
RAG Pipeline Flow
text
1. DOCUMENT INGESTION
   PDF Upload → Text Extraction → Semantic Chunking → Embedding Generation → Vector Storage

2. QUERY PROCESSING
   User Question → Translation → Hybrid Search (BM25 + Vector) → Re-ranking → Top-k Retrieval

3. ANSWER GENERATION
   Retrieved Chunks + Question → LLM Prompting → Citation Extraction → Response Formatting

4. RESPONSE DELIVERY
   Answer + Citations → Translation (if needed) → UI Display with Source Viewer
Technology Stack Highlights
Frontend Layer:

React.js - Component-based UI

Vite - Fast build tooling

Real-time Chat - Interactive Q&A interface

Source Viewer - Citation visualization pane

Backend Layer:

Node.js + Express - REST API server

RAG Pipeline - Hybrid retrieval & generation

Multilingual Support - Translation middleware

Safety Filters - Prompt injection protection

Data Layer:

PostgreSQL - Relational database

pgVector - Vector similarity search

BM25 Integration - Traditional keyword search

Hybrid Indexing - Combined retrieval strategy

AI/ML Services:

OpenAI GPT-4 - Answer generation

Embedding Models - Semantic search

Cross-encoder - Re-ranking optimization

Translation API - Multilingual support

Key Architectural Decisions
✅ Hybrid Search Strategy

pgVector for semantic similarity

BM25 for keyword matching

Reciprocal Rank Fusion for balanced results

Cross-encoder re-ranking for quality improvement

✅ PostgreSQL + pgVector Choice

Single database for vectors + metadata

ACID compliance for data integrity

Proven production reliability

Simplified infrastructure

✅ Node.js Backend

JavaScript full-stack consistency

Excellent async/await for AI API calls

Rich ecosystem for document processing

Fast prototyping capabilities

📁 Project Structure
text
A1-Course_QA_Bot-/
├── frontend/                 # React.js UI Application
│   ├── src/
│   │   ├── components/       # Chat, Uploader, Viewer
│   │   ├── services/         # API clients
│   │   └── App.jsx          # Main component
│   └── vite.config.js
│
├── backend/                  # Node.js API Server
│   ├── routes/              # /answer, /source, /feedback
│   ├── models/              # RAG pipeline, embeddings
│   ├── db/                  # PostgreSQL queries & schema
│   └── server.js            # Express app
│
├── db/                      # Database Schema & Migrations
│   ├── schema.sql           # pgVector tables
│   └── migrations/          # Version control
│
├── evaluation/              # Performance Metrics
│   ├── evaluate.py          # Recall, faithfulness tests
│   └── gold_qa.json         # Test dataset
│
└── docs/                    # Documentation
    ├── architecture.png     # System diagram
    ├── one-pager.pdf        # Project summary
    └── sample-data/         # Example PDFs
This architecture ensures scalability, maintainability, and high performance while meeting all project requirements for hybrid retrieval, citations, and multilingual support.



