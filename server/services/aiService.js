// Basic AI service for report categorization and sentiment analysis
// In production, this would integrate with more sophisticated AI/ML services

const categorizeReport = async (description) => {
  const text = description.toLowerCase();
  
  // Simple keyword-based categorization
  const categories = {
    harassment: ['harassment', 'harassed', 'stalking', 'unwanted', 'inappropriate'],
    assault: ['assault', 'attack', 'violence', 'physical', 'fight', 'battery'],
    theft: ['theft', 'stolen', 'robbery', 'burglary', 'missing', 'lost'],
    vandalism: ['vandalism', 'damage', 'broken', 'destroyed', 'graffiti'],
    suspicious_activity: ['suspicious', 'strange', 'weird', 'odd', 'unusual'],
    emergency: ['emergency', 'urgent', 'critical', 'danger', 'help'],
    safety_hazard: ['hazard', 'dangerous', 'unsafe', 'risk', 'accident'],
    discrimination: ['discrimination', 'racist', 'sexist', 'bias', 'prejudice'],
    bullying: ['bullying', 'bullied', 'intimidation', 'threat', 'harassment'],
    other: []
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'other';
};

const analyzeSentiment = async (description) => {
  const text = description.toLowerCase();
  
  // Simple sentiment analysis based on keywords
  const positiveWords = ['safe', 'resolved', 'helpful', 'good', 'fine', 'okay'];
  const negativeWords = ['scared', 'afraid', 'terrified', 'worried', 'concerned', 'fear'];
  const distressedWords = ['emergency', 'urgent', 'critical', 'danger', 'help', 'panic', 'terrified'];
  
  if (distressedWords.some(word => text.includes(word))) {
    return 'distressed';
  }
  
  if (negativeWords.some(word => text.includes(word))) {
    return 'negative';
  }
  
  if (positiveWords.some(word => text.includes(word))) {
    return 'positive';
  }
  
  return 'neutral';
};

const analyzePriority = (category, sentiment, description) => {
  // Priority analysis based on category and sentiment
  const highPriorityCategories = ['assault', 'emergency', 'safety_hazard'];
  const mediumPriorityCategories = ['harassment', 'theft', 'suspicious_activity'];
  
  if (highPriorityCategories.includes(category) || sentiment === 'distressed') {
    return 'critical';
  }
  
  if (mediumPriorityCategories.includes(category) || sentiment === 'negative') {
    return 'high';
  }
  
  return 'medium';
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