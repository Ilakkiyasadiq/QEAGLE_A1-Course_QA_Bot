# API Documentation

Overview
- Base URL (development): http://localhost:5000
- Authentication: none
- Content types: application/json for JSON endpoints; multipart/form-data for file upload
- Error format: { "error": "..." }

Health
- GET /
  - 200: text/plain "✅ Course Q&A Bot API is running!"

Answer
- POST /answer
  - Description: Retrieve an answer and citations for a natural-language query using the current knowledge base.
  - Request (application/json):
    - query (string, required): user question
    - lang (string, optional, default: "en"): target language code
    - top_k (integer, optional, default: 5): number of chunks to retrieve
  - Response (application/json):
    - answer (string): final answer text
    - citations (array): list of citation objects
      - source_id (integer): chunk identifier
      - span (string): excerpt from the source chunk
      - score (number): relevance score in [0,1)
    - usage: { tokens (number) }
    - latency_ms (number)
  - Status codes:
    - 200: success (answer may indicate insufficient information depending on retrieval results)
    - 500: server error
  - Example request (curl):
    ```bash path=null start=null
    curl -s -X POST http://localhost:5000/answer \
      -H "Content-Type: application/json" \
      -d '{"query":"What is the grading policy?","lang":"en","top_k":5}'
    ```
  - Example request (PowerShell):
    ```powershell path=null start=null
    $base = "http://localhost:5000"
    $body = @{ query = "What is the grading policy?"; lang = "en"; top_k = 5 } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "$base/answer" -ContentType "application/json" -Body $body
    ```
  - Example response:
    ```json path=null start=null
    {
      "answer": "I don't have enough information in the current knowledge base to answer that. Please ingest relevant sources or rephrase your question.",
      "citations": [],
      "usage": { "tokens": 0 },
      "latency_ms": 12
    }
    ```

Source
- GET /source/:id
  - Description: Fetch the full text and metadata for a specific retrieved chunk (by chunk_id).
  - Path params:
    - id (integer, required): chunk_id
  - Response (application/json):
    - source_id (integer)
    - doc_id (integer)
    - page_num (integer)
    - text (string)
    - metadata (object|null)
  - Status codes:
    - 200: success
    - 404: not found
    - 500: server error
  - Example (curl):
    ```bash path=null start=null
    curl -s http://localhost:5000/source/1
    ```
  - Example (PowerShell):
    ```powershell path=null start=null
    $base = "http://localhost:5000"
    Invoke-RestMethod -Method Get -Uri "$base/source/1"
    ```
  - Example response:
    ```json path=null start=null
    {
      "source_id": 1,
      "doc_id": 1,
      "page_num": 1,
      "text": "...full chunk text...",
      "metadata": { "idx": 0 }
    }
    ```

Feedback
- POST /feedback
  - Description: Submit labeled feedback for a query/answer. Labels are constrained by the database to 'good' or 'bad'.
  - Request (application/json):
    - query (string, required)
    - label (string, required): one of 'good' | 'bad'
    - answer_id (string, optional)
    - note (string, optional)
  - Response (application/json):
    - { "status": "ok" }
  - Status codes:
    - 200: success
    - 400: validation error (e.g., missing query or label)
    - 500: server error
  - Example (curl):
    ```bash path=null start=null
    curl -s -X POST http://localhost:5000/feedback \
      -H "Content-Type: application/json" \
      -d '{"query":"What is the grading policy?","answer_id":"ans-123","label":"good","note":"Accurate"}'
    ```
  - Example (PowerShell):
    ```powershell path=null start=null
    $base = "http://localhost:5000"
    $body = @{ query = "What is the grading policy?"; answer_id = "ans-123"; label = "good"; note = "Accurate" } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "$base/feedback" -ContentType "application/json" -Body $body
    ```

Ingest
- POST /ingest (multipart/form-data)
  - Description: Ingest a text-like document. The server chunks, embeds, and stores it.
  - Form fields:
    - file (file, required): text/markdown/csv file
    - title (string, optional): defaults to original filename
    - chunkSize (integer, optional): default 1000
    - overlap (integer, optional): default 200
  - Response (application/json):
    - status ("ok")
    - doc_id (integer)
    - chunks_inserted (integer)
  - Status codes:
    - 200: success
    - 400: file missing
    - 500: server error
  - Example (curl):
    ```bash path=null start=null
    curl -s -X POST http://localhost:5000/ingest \
      -F "file=@./docs/sample-data/example.txt" \
      -F "title=Week 1 Notes" \
      -F "chunkSize=1200" \
      -F "overlap=200"
    ```
  - Example (PowerShell):
    ```powershell path=null start=null
    $base = "http://localhost:5000"
    $form = @{
      file      = Get-Item "D:\\path\\to\\example.txt"
      title     = "Week 1 Notes"
      chunkSize = 1200
      overlap   = 200
    }
    Invoke-RestMethod -Method Post -Uri "$base/ingest" -Form $form
    ```
  - Example response:
    ```json path=null start=null
    { "status": "ok", "doc_id": 3, "chunks_inserted": 42 }
    ```

Administration
- POST /admin/clear
  - Description: Danger — deletes all documents and chunks (resets identities).
  - Request (application/json):
    - confirm (string, required): must equal "DELETE"
  - Response (application/json):
    - { "status": "ok" }
  - Status codes:
    - 200: success
    - 400: confirmation missing/invalid
    - 500: server error
  - Example (curl):
    ```bash path=null start=null
    curl -s -X POST http://localhost:5000/admin/clear \
      -H "Content-Type: application/json" \
      -d '{"confirm":"DELETE"}'
    ```
  - Example (PowerShell):
    ```powershell path=null start=null
    $base = "http://localhost:5000"
    $body = @{ confirm = "DELETE" } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "$base/admin/clear" -ContentType "application/json" -Body $body
    ```

Notes
- Answer behavior depends on retrieval relevance; when below MIN_RELEVANCE_SCORE (default 0.35), API returns an "insufficient information" style answer with empty citations.
- Embedding dimension is fixed at 768 in the database schema; changing embedding models requires aligning EMBEDDINGS_DIM and re-running migrations.
- Frontend expects VITE_API_BASE to point at this API.
