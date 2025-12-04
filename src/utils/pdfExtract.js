import fs from "node:fs";
import path from "node:path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

/**
 * Extract text from PDF using pdf-parse
 * Works well for most text-based PDFs
 */
const extractPdfText = async (filePath) => {
  try {
    console.log("🔍 Starting PDF text extraction for:", path.basename(filePath));
    
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const extractedText = data.text.trim();
    
    if (!extractedText || extractedText.length === 0) {
      throw new Error("PDF appears to be empty or contains no extractable text.");
    }
    
    if (extractedText.length < 50) {
      console.warn("⚠️ Warning: Very little text extracted (" + extractedText.length + " characters)");
    }
    
    console.log("✅ Text extracted successfully:");
    console.log("   - Total characters:", extractedText.length);
    console.log("   - Total pages:", data.numpages);
    console.log("   - Preview:", extractedText.substring(0, 150).replace(/\n/g, " ") + "...");
    
    return extractedText;
  } catch (error) {
    console.error("❌ Error extracting PDF text:", error.message);
    
    if (error.message.includes("Invalid PDF")) {
      throw new Error("Invalid PDF file. Please upload a valid PDF document.");
    }
    
    throw new Error("Failed to extract text from PDF. " + error.message);
  }
};

/**
 * Get PDF metadata
 */
export const getPDFInfo = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    return {
      pages: data.numpages,
      info: data.info,
      metadata: data.metadata,
      version: data.version,
      textLength: data.text.length
    };
  } catch (error) {
    console.error("Error getting PDF info:", error);
    return null;
  }
};

export default extractPdfText;
