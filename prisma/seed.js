const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "8721e564-997d-47cd-8d46-6a41e468dadb" },
    update: {},
    create: {
      id: "8721e564-997d-47cd-8d46-6a41e468dadb",
      firstName: "Admin",
      familyName: "User",
      email: "admin@example.com",
      password: "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
      role: "Musician",
    },
  });

  const band = await prisma.band.upsert({
    where: { id: "63ae2224-74e0-4a83-8aec-90cfb1d96a2e" },
    update: {},
    create: {
      id: "63ae2224-74e0-4a83-8aec-90cfb1d96a2e",
      name: "Default Band",
      genre: "ROCK",
      imageUrl:
        "https://img.freepik.com/free-vector/illustration-rock-band_23-2149593909.jpg",
      members: {
        connect: { id: user.id },
      },
    },
  });

  await prisma.offer.upsert({
    where: { id: "db0185c6-6a12-4825-9620-c13b8bde082e" },
    update: {},
    create: {
      id: "db0185c6-6a12-4825-9620-c13b8bde082e",
      bandId: band.id,
      price: 100,
      description: "Special offer for our first customers!",
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
