import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const destinations = [
  { name: "Paris", country: "France", region: "Europe", description: "The city of love, art, and fashion", dailyBudget: 180, popularity: 95, rating: 4.8, climate: "temperate", travelType: "cultural", tags: ["romance", "art", "fashion", "food"], isPopular: true },
  { name: "Tokyo", country: "Japan", region: "Asia", description: "A fascinating blend of traditional and ultramodern", dailyBudget: 150, popularity: 92, rating: 4.9, climate: "humid subtropical", travelType: "cultural", tags: ["technology", "food", "tradition", "shopping"], isPopular: true },
  { name: "New York", country: "USA", region: "Americas", description: "The city that never sleeps", dailyBudget: 250, popularity: 90, rating: 4.7, climate: "humid continental", travelType: "urban", tags: ["shopping", "entertainment", "food", "business"], isPopular: true },
  { name: "Bali", country: "Indonesia", region: "Asia", description: "Tropical paradise with rich culture", dailyBudget: 80, popularity: 88, rating: 4.6, climate: "tropical", travelType: "nature", tags: ["beach", "spirituality", "nature", "surf"], isPopular: true },
  { name: "London", country: "UK", region: "Europe", description: "History meets modern sophistication", dailyBudget: 200, popularity: 87, rating: 4.7, climate: "oceanic", travelType: "cultural", tags: ["history", "museums", "theater", "royalty"], isPopular: true },
  { name: "Barcelona", country: "Spain", region: "Europe", description: "Gaudi's masterpieces and Mediterranean vibes", dailyBudget: 140, popularity: 85, rating: 4.6, climate: "mediterranean", travelType: "cultural", tags: ["architecture", "beach", "food", "nightlife"], isPopular: true },
  { name: "Dubai", country: "UAE", region: "Middle East", description: "Luxury and futuristic architecture", dailyBudget: 220, popularity: 84, rating: 4.5, climate: "desert", travelType: "luxury", tags: ["shopping", "luxury", "desert", "modern"], isPopular: true },
  { name: "Sydney", country: "Australia", region: "Oceania", description: "Stunning harbor and beaches", dailyBudget: 180, popularity: 82, rating: 4.6, climate: "temperate", travelType: "nature", tags: ["beach", "harbor", "nature", "food"], isPopular: true },
  { name: "Rome", country: "Italy", region: "Europe", description: "The Eternal City of ancient wonders", dailyBudget: 160, popularity: 91, rating: 4.8, climate: "mediterranean", travelType: "cultural", tags: ["history", "art", "food", "ancient"], isPopular: true },
  { name: "Santorini", country: "Greece", region: "Europe", description: "White-washed buildings and stunning sunsets", dailyBudget: 170, popularity: 89, rating: 4.7, climate: "mediterranean", travelType: "romance", tags: ["romance", "sunset", "island", "photography"], isPopular: true },
  { name: "Bangkok", country: "Thailand", region: "Asia", description: "Temples, street food, and vibrant culture", dailyBudget: 60, popularity: 86, rating: 4.5, climate: "tropical", travelType: "adventure", tags: ["food", "temples", "shopping", "nightlife"], isPopular: true },
  { name: "Amsterdam", country: "Netherlands", region: "Europe", description: "Canals, museums, and cycling culture", dailyBudget: 160, popularity: 80, rating: 4.6, climate: "oceanic", travelType: "cultural", tags: ["cycling", "museums", "canals", "liberal"], isPopular: false },
  { name: "Maldives", country: "Maldives", region: "Asia", description: "Crystal clear waters and overwater villas", dailyBudget: 400, popularity: 83, rating: 4.9, climate: "tropical", travelType: "luxury", tags: ["beach", "honeymoon", "diving", "luxury"], isPopular: true },
  { name: "Prague", country: "Czech Republic", region: "Europe", description: "Medieval architecture at its finest", dailyBudget: 100, popularity: 78, rating: 4.6, climate: "continental", travelType: "cultural", tags: ["history", "architecture", "beer", "affordable"], isPopular: false },
  { name: "Singapore", country: "Singapore", region: "Asia", description: "Futuristic city-state with amazing food", dailyBudget: 180, popularity: 81, rating: 4.7, climate: "tropical", travelType: "urban", tags: ["food", "shopping", "modern", "clean"], isPopular: false },
  { name: "Cape Town", country: "South Africa", region: "Africa", description: "Stunning nature and vibrant culture", dailyBudget: 120, popularity: 75, rating: 4.5, climate: "mediterranean", travelType: "adventure", tags: ["nature", "wine", "wildlife", "adventure"], isPopular: false },
  { name: "Los Angeles", country: "USA", region: "Americas", description: "Hollywood, beaches, and endless sunshine", dailyBudget: 200, popularity: 83, rating: 4.4, climate: "mediterranean", travelType: "entertainment", tags: ["beach", "hollywood", "theme parks", "shopping"], isPopular: false },
  { name: "Istanbul", country: "Turkey", region: "Europe", description: "Where East meets West", dailyBudget: 90, popularity: 84, rating: 4.6, climate: "temperate", travelType: "cultural", tags: ["history", "food", "bazaars", "architecture"], isPopular: false },
  { name: "Lisbon", country: "Portugal", region: "Europe", description: "Colorful streets and Atlantic views", dailyBudget: 110, popularity: 77, rating: 4.5, climate: "mediterranean", travelType: "cultural", tags: ["street art", "food", "fado", "beach"], isPopular: false },
  { name: "Kyoto", country: "Japan", region: "Asia", description: "Ancient temples and traditional gardens", dailyBudget: 140, popularity: 86, rating: 4.8, climate: "humid subtropical", travelType: "cultural", tags: ["temples", "tradition", "gardens", "tea"], isPopular: false },
  { name: "Queenstown", country: "New Zealand", region: "Oceania", description: "Adventure capital of the world", dailyBudget: 180, popularity: 74, rating: 4.7, climate: "oceanic", travelType: "adventure", tags: ["adventure", "nature", "skiing", "mountains"], isPopular: false },
];

const categories = [
  { name: "Sightseeing", icon: "landmark" },
  { name: "Food & Dining", icon: "utensils" },
  { name: "Shopping", icon: "shopping-bag" },
  { name: "Nightlife", icon: "moon" },
  { name: "Outdoor", icon: "trees" },
  { name: "Art & Culture", icon: "palette" },
  { name: "Adventure", icon: "mountain" },
  { name: "Relaxation", icon: "spa" },
  { name: "Entertainment", icon: "ticket" },
  { name: "Sports", icon: "trophy" },
];

const activities = [
  { name: "Eiffel Tower Visit", description: "Iconic landmark with stunning city views", location: "Paris", cost: 26, categoryName: "Sightseeing", duration: "2-3 hours", isIndoor: false, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Louvre Museum", description: "World's largest art museum", location: "Paris", cost: 17, categoryName: "Art & Culture", duration: "3-4 hours", isIndoor: true, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Tokyo Tower", description: "Iconic communications and observation tower", location: "Tokyo", cost: 12, categoryName: "Sightseeing", duration: "1-2 hours", isIndoor: false, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Shibuya Crossing", description: "World's busiest pedestrian crossing", location: "Tokyo", cost: 0, categoryName: "Sightseeing", duration: "30 min", isIndoor: false, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Central Park", description: "Urban oasis in Manhattan", location: "New York", cost: 0, categoryName: "Outdoor", duration: "2-3 hours", isIndoor: false, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Uluwatu Temple", description: "Cliffside temple with Kecak dance", location: "Bali", cost: 15, categoryName: "Sightseeing", duration: "3-4 hours", isIndoor: false, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "British Museum", description: "One of the world's greatest museums", location: "London", cost: 0, categoryName: "Art & Culture", duration: "3-4 hours", isIndoor: true, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "La Sagrada Familia", description: "Gaudi's unfinished masterpiece", location: "Barcelona", cost: 26, categoryName: "Art & Culture", duration: "2-3 hours", isIndoor: false, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Burj Khalifa", description: "World's tallest building", location: "Dubai", cost: 60, categoryName: "Sightseeing", duration: "1-2 hours", isIndoor: true, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Sydney Opera House", description: "Iconic performing arts center", location: "Sydney", cost: 40, categoryName: "Entertainment", duration: "2-3 hours", isIndoor: true, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Colosseum", description: "Ancient Roman amphitheater", location: "Rome", cost: 18, categoryName: "History", duration: "2-3 hours", isIndoor: false, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Santorini Sunset Cruise", description: "Catamaran cruise with dinner", location: "Santorini", cost: 120, categoryName: "Relaxation", duration: "5 hours", isIndoor: false, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Chatuchak Market", description: "Huge weekend market", location: "Bangkok", cost: 0, categoryName: "Shopping", duration: "3-4 hours", isIndoor: false, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Anne Frank House", description: "Historical museum in Secret Annex", location: "Amsterdam", cost: 14, categoryName: "History", duration: "1-2 hours", isIndoor: true, isFamilyFriendly: false, adventureLevel: "easy" },
  { name: "Gardens by the Bay", description: "Supertree Grove and cloud forest", location: "Singapore", cost: 20, categoryName: "Nature", duration: "2-3 hours", isIndoor: true, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Table Mountain", description: "Flat-topped mountain with cable car", location: "Cape Town", cost: 30, categoryName: "Adventure", duration: "3-4 hours", isIndoor: false, isFamilyFriendly: true, adventureLevel: "moderate" },
  { name: "Hollywood Sign", description: "Iconic LA landmark hike", location: "Los Angeles", cost: 0, categoryName: "Adventure", duration: "2-3 hours", isIndoor: false, isFamilyFriendly: false, adventureLevel: "moderate" },
  { name: "Grand Bazaar", description: "Historic covered market", location: "Istanbul", cost: 0, categoryName: "Shopping", duration: "2-3 hours", isIndoor: true, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Fado Night", description: "Traditional Portuguese music dinner", location: "Lisbon", cost: 50, categoryName: "Nightlife", duration: "3 hours", isIndoor: true, isFamilyFriendly: false, adventureLevel: "easy" },
  { name: "Kinkaku-ji", description: "Golden Pavilion temple", location: "Kyoto", cost: 5, categoryName: "Sightseeing", duration: "1 hour", isIndoor: false, isFamilyFriendly: true, adventureLevel: "easy" },
  { name: "Skydiving", description: "Tandem skydiving over lake", location: "Queenstown", cost: 300, categoryName: "Adventure", duration: "3 hours", isIndoor: false, isFamilyFriendly: false, adventureLevel: "challenging" },
  { name: "Underwater Restaurant", description: "Dining with ocean views", location: "Maldives", cost: 150, categoryName: "Food & Dining", duration: "2 hours", isIndoor: true, isFamilyFriendly: true, adventureLevel: "easy" },
];

async function main() {
  console.log("Seeding database...");

  // Create activity categories
  for (const cat of categories) {
    await prisma.activityCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log("Created activity categories");

  // Create destinations
  for (const dest of destinations) {
    await prisma.destination.upsert({
      where: { name: dest.name },
      update: dest,
      create: dest,
    });
  }
  console.log("Created destinations");

  // Create activities
  for (const act of activities) {
    const category = await prisma.activityCategory.findUnique({
      where: { name: act.categoryName! },
    });

    const { categoryName, ...activityWithoutCategory } = act;
    await prisma.activity.upsert({
      where: { name: act.name },
      update: { ...activityWithoutCategory, categoryId: category?.id },
      create: { ...activityWithoutCategory, categoryId: category?.id },
    });
  }
  console.log("Created activities");

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });