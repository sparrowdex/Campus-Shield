// Basic AI service for report categorization and sentiment analysis
// In production, this would integrate with more sophisticated AI/ML services

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

// For text-only input, use the gemini-pro model
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const categorizeReport = async (description) => {
  const categories = [
    'harassment', 'assault', 'theft', 'vandalism',
    'suspicious_activity', 'emergency', 'safety_hazard',
    'discrimination', 'bullying', 'other'
  ];

  const prompt = `Categorize the following incident report description into one of these categories: ${categories.join(', ')}.
  If none of the categories fit well, use 'other'.
  Report Description: "${description}"
  Category:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim().toLowerCase();

    // Basic parsing: Gemini might return more than just the category name.
    // We try to find a matching category within the response.
    for (const cat of categories) {
      if (text.includes(cat)) {
        return cat;
      }
    }
    return 'other'; // Fallback if parsing fails or no category is found
  } catch (error) {
    console.error("Error categorizing report with Gemini:", error);
    return 'other'; // Fallback in case of API error
  }
};


const analyzeSentiment = async (description) => {
  const sentiments = ['positive', 'neutral', 'negative', 'distressed'];
  const prompt = `Analyze the sentiment of the following incident report description. Respond with only one of these words: ${sentiments.join(', ')}.
  Report Description: "${description}"
  Sentiment:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toLowerCase();

    for (const sentiment of sentiments) {
      if (text.includes(sentiment)) {
        return sentiment;
      }
    }
    return 'neutral'; // Fallback
  } catch (error) {
    console.error("Error analyzing sentiment with Gemini:", error);
    return 'neutral'; // Fallback in case of API error
  }
};

const analyzePriority = async (category, sentiment, description) => {
  const priorities = ['low', 'medium', 'high', 'critical'];
  const prompt = `Given the following incident report details, determine the priority. Respond with only one of these words: ${priorities.join(', ')}.
  Category: ${category}
  Sentiment: ${sentiment}
  Report Description: "${description}"
  Priority:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toLowerCase();

    for (const priority of priorities) {
      if (text.includes(priority)) {
        return priority;
      }
    }
    return 'medium'; // Fallback
  } catch (error) {
    console.error("Error analyzing priority with Gemini:", error);
    return 'medium'; // Fallback in case of API error
  }
};

const extractKeywords = (description) => {
  // Simple keyword extraction
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  return [...new Set(words)].slice(0, 10); // Return unique keywords, max 10
};

module.exports = {
  categorizeReport,
  analyzeSentiment,
  analyzePriority,
  extractKeywords
}; 