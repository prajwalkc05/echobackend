import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import path from 'path';

const CHUNK_SIZE = 4000;

const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp',
  '.cs', '.go', '.rb', '.php', '.swift', '.kt', '.rs', '.html', '.css',
  '.json', '.xml', '.yaml', '.yml', '.csv', '.sh', '.sql',
]);

function chunkText(text, size = CHUNK_SIZE) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

async function extractFromBuffer(buffer, mimetype, originalname) {
  const ext = path.extname(originalname).toLowerCase();

  // PDF
  if (mimetype === 'application/pdf' || ext === '.pdf') {
    const data = await pdfParse(buffer);
    return { text: data.text, pages: data.numpages, type: 'PDF' };
  }

  // DOCX
  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, type: 'DOCX' };
  }

  // Plain text / code files
  if (mimetype === 'text/plain' || TEXT_EXTENSIONS.has(ext)) {
    return { text: buffer.toString('utf8'), type: 'Text/Code' };
  }

  // CSV
  if (mimetype === 'text/csv' || ext === '.csv') {
    return { text: buffer.toString('utf8'), type: 'CSV' };
  }

  // JSON
  if (mimetype === 'application/json' || ext === '.json') {
    try {
      const parsed = JSON.parse(buffer.toString('utf8'));
      return { text: JSON.stringify(parsed, null, 2), type: 'JSON' };
    } catch {
      return { text: buffer.toString('utf8'), type: 'JSON' };
    }
  }

  // ZIP — extract readable text files inside
  if (
    mimetype === 'application/zip' ||
    mimetype === 'application/x-zip-compressed' ||
    ext === '.zip'
  ) {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    const parts = [];
    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const entryExt = path.extname(entry.entryName).toLowerCase();
      if (TEXT_EXTENSIONS.has(entryExt) || entryExt === '.txt' || entryExt === '.md') {
        const content = entry.getData().toString('utf8');
        parts.push(`--- ${entry.entryName} ---\n${content}`);
      }
    }
    return { text: parts.join('\n\n') || 'No readable text files found in ZIP.', type: 'ZIP' };
  }

  // Image — return metadata only (no OCR without external service)
  if (mimetype.startsWith('image/')) {
    return {
      text: `[Image file: ${originalname} (${mimetype}). Describe what you see or ask questions about this image.]`,
      type: 'Image',
    };
  }

  return { text: `[Unsupported file type: ${originalname}]`, type: 'Unknown' };
}

export async function processFiles(files) {
  if (!files || files.length === 0) return null;

  const results = await Promise.all(
    files.map(f => extractFromBuffer(f.buffer, f.mimetype, f.originalname))
  );

  const combined = results
    .map((r, i) => `=== FILE ${i + 1}: ${files[i].originalname} (${r.type}) ===\n${r.text}`)
    .join('\n\n');

  // Chunk if too large, return first 3 chunks (~12000 chars) to stay within token limits
  const chunks = chunkText(combined);
  return chunks.slice(0, 3).join('\n\n[...continued...]\n\n');
}

export const ALLOWED_MIMETYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'application/json',
  'text/plain',
  'text/csv',
  'text/markdown',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);
