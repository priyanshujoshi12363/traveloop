import prisma from "./prisma";
async function main() {
  const cities = [
    {
      name: "Paris",
      country: "France",
      description: "The City of Light, known for its art, fashion, and culture.",
      image: "/uploads/paris.jpg",
      costIndex: "high",
      popularity: 10,
      timeZone: "CET",
      attractions: ["Eiffel Tower", "Louvre Museum", "Notre-Dame"],
    },
    {
      name: "Rome",
      country: "Italy",
      description: "The Eternal City, rich in history and architecture.",
      image: "/uploads/rome.jpg",
      costIndex: "medium",
      popularity: 9,
      timeZone: "CET",
      attractions: ["Colosseum", "Vatican City", "Trevi Fountain"],
    },
    {
      name: "Tokyo",
      country: "Japan",
      description: "A vibrant metropolis blending tradition and modernity.",
      image: "/uploads/tokyo.jpg",
      costIndex: "high",
      popularity: 8,
      timeZone: "JST",
      attractions: ["Tokyo Tower", "Shibuya Crossing", "Meiji Shrine"],
    },
    {
      name: "Bangkok",
      country: "Thailand",
      description: "A bustling city known for its temples and street food.",
      image: "/uploads/bangkok.jpg",
      costIndex: "low",
      popularity: 8,
      timeZone: "ICT",
      attractions: ["Grand Palace", "Wat Pho", "Chatuchak Market"],
    },
    {
      name: "New York",
      country: "USA",
      description: "The Big Apple, a global hub of commerce and culture.",
      image: "/uploads/nyc.jpg",
      costIndex: "high",
      popularity: 10,
      timeZone: "EST",
      attractions: ["Statue of Liberty", "Times Square", "Central Park"],
    },
  ];

  for (const city of cities) {
    await prisma.cityExploration.upsert({
      where: {
        name_country: {
          name: city.name,
          country: city.country,
        },
      },
      update: {},
      create: city,
    });
  }

  console.log("Cities seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });