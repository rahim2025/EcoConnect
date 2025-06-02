// Helper functions for setting default user profile values

export const getDefaultEcoInterests = () => {
  return [
    "Sustainability",
    "Climate Action", 
    "Green Living",
    "Renewable Energy",
    "Recycling",
    "Organic Farming",
    "Zero Waste",
    "Conservation",
    "Environmental Education",
    "Clean Transportation"
  ];
};

export const getRandomDefaultInterests = (count = 3) => {
  const allInterests = getDefaultEcoInterests();
  const shuffled = allInterests.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const generateDefaultBio = (fullName) => {
  const bioTemplates = [
    `🌱 Hi, I'm ${fullName}! New to EcoConnect and excited to learn about sustainable living and climate action.`,
    `🌍 ${fullName} here! Passionate about making a positive environmental impact, one step at a time.`,
    `♻️ Hello! I'm ${fullName}, committed to living sustainably and connecting with like-minded eco-warriors.`,
    `🌿 ${fullName} - just joined EcoConnect to learn, share, and grow in my sustainability journey!`,
    `🌎 Welcome! I'm ${fullName}, ready to make a difference through community action and green living.`
  ];
  
  return bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
};

export const getEcoMotivationalQuotes = () => {
  return [
    "Small acts, when multiplied by millions of people, can transform the world. 🌍",
    "Be the change you wish to see in the world. 🌱", 
    "The Earth does not belong to us; we belong to the Earth. 🌿",
    "Every day is Earth Day when you care about the planet. ♻️",
    "Sustainability is not about perfection, it's about progress. 🌟"
  ];
};

export const getDefaultProfileCompletion = (user) => {
  let score = 0;
  let suggestions = [];
  
  // Check profile completeness
  if (user.profilePic && user.profilePic !== "") score += 20;
  else suggestions.push("Add a profile picture");
  
  if (user.bio && user.bio.length > 20) score += 20;
  else suggestions.push("Write a meaningful bio");
  
  if (user.location && user.location !== "") score += 15;
  else suggestions.push("Add your location");
  
  if (user.interests && user.interests.length >= 3) score += 15;
  else suggestions.push("Add more interests (at least 3)");
  
  if (user.followers && user.followers.length > 0) score += 15;
  else suggestions.push("Connect with other eco-enthusiasts");
  
  if (user.ecoPoints && user.ecoPoints > 100) score += 15;
  else suggestions.push("Engage more to earn eco points");
  
  return {
    score,
    suggestions,
    isComplete: score >= 80
  };
};

export const suggestInterestsBasedOnLocation = (location) => {
  const locationInterests = {
    "coastal": ["Ocean Conservation", "Marine Protection", "Beach Cleanup"],
    "urban": ["Urban Gardening", "Air Quality", "Sustainable Transportation"],
    "rural": ["Organic Farming", "Wildlife Conservation", "Local Food Systems"],
    "mountain": ["Forest Conservation", "Hiking", "Clean Water"],
    "desert": ["Water Conservation", "Solar Energy", "Desert Ecology"]
  };
  
  const locationLower = location.toLowerCase();
  
  for (const [type, interests] of Object.entries(locationInterests)) {
    if (locationLower.includes(type) || 
        (type === "coastal" && (locationLower.includes("beach") || locationLower.includes("coast"))) ||
        (type === "urban" && (locationLower.includes("city") || locationLower.includes("town"))) ||
        (type === "mountain" && (locationLower.includes("mountain") || locationLower.includes("hill")))) {
      return interests;
    }
  }
  
  return [];
};
