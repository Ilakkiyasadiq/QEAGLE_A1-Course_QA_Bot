#!/usr/bin/env node
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { ingestFile } from "./services/ingestion.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file") args.file = argv[++i];
    else if (a === "--title") args.title = argv[++i];
    else if (a === "--chunk-size") args.chunkSize = Number(argv[++i]);
    else if (a === "--overlap") args.overlap = Number(argv[++i]);
    else if (a === "--help" || a === "-h") args.help = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.file) {
    console.log("Usage: node ingest.js --file <path-to-text-or-md> [--title <title>]");
    process.exit(args.help ? 0 : 1);
  }
  const options = {};
  if (Number.isFinite(args.chunkSize)) options.chunkSize = args.chunkSize;
  if (Number.isFinite(args.overlap)) options.overlap = args.overlap;
  const res = await ingestFile(args.file, args.title, options);
  console.log(`✅ Ingested document doc_id=${res.doc_id}, chunks=${res.chunks_inserted}`);
}

main().catch((e) => {
  console.error("❌ Ingest failed:", e.message);
  process.exit(1);
});
