import requests
import json
import time
import numpy as np

API_URL = "http://localhost:5000/answer"
MODES = ["vector", "hybrid", "hybrid_rerank"]  # adjust if different in your backend
TOP_K = 5

def load_gold_qa(file="gold_qa.json"):
    with open(file, "r", encoding="utf-8") as f:
        return json.load(f)

def test_mode(mode, gold_qa):
    recalls = []
    faithfulness = []
    latencies = []

    for q in gold_qa:
        query = q["query"]
        expected_keywords = [kw.lower() for kw in q["expected_keywords"]]

        body = {"query": query, "lang": "en", "top_k": TOP_K, "mode": mode}
        start = time.time()
        resp = requests.post(API_URL, json=body)
        elapsed = time.time() - start
        latencies.append(elapsed)

        if resp.status_code != 200:
            print(f"Error for query '{query}': {resp.text}")
            continue

        data = resp.json()
        answer = data.get("answer", "").lower()
        citations = data.get("citations", [])

        # Recall@5 (proxy): check if any expected keyword appears in citations
        recall_hit = any(
            any(kw in c.get("span", "").lower() for kw in expected_keywords)
            for c in citations[:TOP_K]
        )
        recalls.append(1 if recall_hit else 0)

        # Faithfulness (proxy): check if answer uses at least one keyword from sources
        faithful = any(kw in answer for kw in expected_keywords)
        faithfulness.append(1 if faithful else 0)

    recall_at_5 = sum(recalls) / len(recalls)
    faithful_score = sum(faithfulness) / len(faithfulness)
    p95_latency = np.percentile(latencies, 95)

    return {
        "recall@5": recall_at_5,
        "faithfulness": faithful_score,
        "p95_latency": p95_latency,
    }

if __name__ == "__main__":
    gold_qa = load_gold_qa()
    results = {}
    for mode in MODES:
        print(f"\nTesting mode: {mode}")
        metrics = test_mode(mode, gold_qa)
        results[mode] = metrics
        print(json.dumps(metrics, indent=2))

    print("\n=== Final Results ===")
    print(json.dumps(results, indent=2))
