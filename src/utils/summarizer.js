import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate a comprehensive summary using Google Gemini AI
 */
const summarizeText = async (text = "") => {
  if (!text) {
    return "No content provided to summarize.";
  }

  const normalized = text.replace(/\s+/g, " ").trim();

  // If text is very short, return as is
  if (normalized.length <= 100) {
    return normalized;
  }

  // If no API key, fall back to simple truncation
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY not found, using simple summarization");
    return normalized.length <= 500 
      ? normalized 
      : `${normalized.slice(0, 497)}...`;
  }

  try {
    console.log("🤖 Generating AI summary with Gemini...");
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Truncate text if too long (Gemini has token limits)
    const maxChars = 30000; // Approximately 7500 tokens
    const textToSummarize = normalized.length > maxChars 
      ? normalized.slice(0, maxChars) + "..." 
      : normalized;

    const prompt = `Please provide a comprehensive and well-structured summary of the following text. 
    
The summary should:
- Capture the main ideas and key points
- Be concise but informative (aim for 3-5 paragraphs)
- Maintain the original context and meaning
- Highlight important concepts or themes
- Be written in clear, professional language

Text to summarize:
${textToSummarize}

Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    console.log("✅ AI summary generated successfully:", summary.length, "characters");
    
    return summary.trim();
  } catch (error) {
    console.error("❌ Error generating AI summary:", error);
    
    // Fall back to simple summarization if AI fails
    console.log("⚠️ Falling back to simple summarization");
    
    // Extract first few sentences as a fallback
    const sentences = normalized.match(/[^.!?]+[.!?]+/g) || [];
    const fallbackSummary = sentences.slice(0, 5).join(" ");
    
    return fallbackSummary.length > 0 
      ? fallbackSummary 
      : normalized.slice(0, 500) + "...";
  }
};

/**
 * Generate highlights/key points from text
 */
export const generateHighlights = (text = "", maxLength = 180) => {
  if (!text) return "";
  
  const normalized = text.replace(/\s+/g, " ").trim();
  
  if (normalized.length <= maxLength) {
    return normalized;
  }
  
  // Try to cut at a sentence boundary
  const truncated = normalized.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastPeriod > maxLength - 50) {
    return truncated.slice(0, lastPeriod + 1);
  } else if (lastSpace > maxLength - 20) {
    return truncated.slice(0, lastSpace) + "...";
  }
  
  return truncated + "...";
};

export default summarizeText;

