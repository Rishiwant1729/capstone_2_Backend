const summarizeText = async (text = "") => {
  if (!text) {
    return "No content provided to summarize.";
  }

  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= 280) {
    return normalized;
  }

  return `${normalized.slice(0, 277)}...`;
};

export default summarizeText;

