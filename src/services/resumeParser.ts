// e:/AI Talent OS/src/services/resumeParser.ts
// Client-side resume file parsing for PDF, DOCX, and TXT formats

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extract text from a PDF file using Mozilla's pdfjs-dist
 */
async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str || '')
      .join(' ');
    pages.push(pageText);
  }

  return pages.join('\n\n');
}

/**
 * Extract text from a DOCX file using mammoth
 */
async function parseDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extract text from a plain text file
 */
async function parseTXT(file: File): Promise<string> {
  return await file.text();
}

/**
 * Clean extracted resume text by normalizing whitespace and removing artifacts
 */
function cleanResumeText(text: string): string {
  return text
    // Remove non-printable characters (except newlines/tabs)
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    // Collapse multiple spaces into one
    .replace(/[ \t]+/g, ' ')
    // Collapse 3+ newlines into 2
    .replace(/\n{3,}/g, '\n\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Final trim
    .trim();
}

export interface ParsedResumeFile {
  text: string;
  format: 'pdf' | 'docx' | 'txt';
  fileName: string;
  fileSize: number;
  pageCount?: number;
}

/**
 * Main entry point: detect file type and extract text
 */
export async function parseResume(file: File): Promise<ParsedResumeFile> {
  const name = file.name.toLowerCase();
  let text = '';
  let format: 'pdf' | 'docx' | 'txt' = 'txt';

  if (name.endsWith('.pdf')) {
    format = 'pdf';
    text = await parsePDF(file);
  } else if (name.endsWith('.docx')) {
    format = 'docx';
    text = await parseDOCX(file);
  } else if (name.endsWith('.txt') || name.endsWith('.text')) {
    format = 'txt';
    text = await parseTXT(file);
  } else {
    throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
  }

  const cleaned = cleanResumeText(text);

  if (cleaned.length < 50) {
    throw new Error('Could not extract meaningful text from the file. Please check the file content and try again.');
  }

  return {
    text: cleaned,
    format,
    fileName: file.name,
    fileSize: file.size,
  };
}
