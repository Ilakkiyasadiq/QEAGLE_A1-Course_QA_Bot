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

## Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/Ilakkiyasadiq/A1-Course_QA_Bot-.git
cd A1-Course_QA_Bot-

### 2. Install Dependencies

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
3. PostgreSQL + pgvector Setup
Enable pgvector extension:

Run the Project

# Start frontend (React + Vite)
cd frontend
npm run dev

# Start backend (Node.js + Express)
cd ../backend
npm start

Usage
1.Upload a course PDF.

2.Ask questions in natural language.

3.Get accurate answers with supporting citations.

Project Structure
/frontend     → React.js UI  
/backend      → Node.js server + API  
/db           → PostgreSQL (pgvector) schema + queries  
/models       → Embedding & RAG pipeline  
/docs         → Sample PDFs, one-pager, architecture diagram  
/evaluation   → evaluation.py , gold_qa.json
Architecture diagram



