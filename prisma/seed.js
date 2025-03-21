const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        id: "8721e564-997d-47cd-8d46-6a41e468dadb",
        firstName: "John",
        familyName: "Doe",
        email: "john.doe@example.com",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Musician",
        imageUrl:
          "https://img.freepik.com/foto-gratis/joven-barbudo-camisa_273609-5938.jpg",
      },
      {
        id: "bf9ef9b4-f46e-47b8-b2b1-12f8b12433bb",
        firstName: "Alice",
        familyName: "Brown",
        email: "alice.brown@example.com",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Musician",
        imageUrl:
          "https://img.freepik.com/foto-gratis/joven-barbudo-camisa_273609-5938.jpg",
      },
      {
        id: "5cbbf2a4-7cf4-482d-8b96-940ecdfcc9fc",
        firstName: "Mike",
        familyName: "Johnson",
        email: "mike.johnson@example.com",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Musician",
        imageUrl:
          "https://img.freepik.com/foto-gratis/joven-barbudo-camisa_273609-5938.jpg",
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        id: "0e3d0435-b60c-433f-bc5d-2c4e18c94fdc",
        firstName: "Jane",
        familyName: "Smith",
        email: "jane.smith@example.com",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Client",
        imageUrl:
          "https://img.freepik.com/foto-gratis/retrato-mujer_23-2147626503.jpg",
      },
      {
        id: "ad1c5d2a-49c8-4b0e-9d93-92d5ad728c13",
        firstName: "Emma",
        familyName: "Davis",
        email: "emma.davis@example.com",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Client",
        imageUrl:
          "https://img.freepik.com/foto-gratis/retrato-mujer_23-2147626503.jpg",
      },
    ],
  });

  await prisma.band.create({
    data: {
      id: "63ae2224-74e0-4a83-8aec-90cfb1d96a2e",
      name: "Rock Legends",
      genre: "ROCK",
      imageUrl:
        "https://img.freepik.com/free-vector/illustration-rock-band_23-2149593909.jpg",
      members: { connect: [{ id: "8721e564-997d-47cd-8d46-6a41e468dadb" }] },
    },
  });

  await prisma.band.create({
    data: {
      id: "2b7e3d4a-8749-4c3c-b6f5-172c1a6c8e62",
      name: "Jazz Masters",
      genre: "JAZZ",
      imageUrl:
        "https://img.freepik.com/free-vector/illustration-rock-band_23-2149593909.jpg",
      members: { connect: [{ id: "bf9ef9b4-f46e-47b8-b2b1-12f8b12433bb" }] },
    },
  });

  await prisma.offer.createMany({
    data: [
      {
        id: "db0185c6-6a12-4825-9620-c13b8bde082e",
        bandId: "63ae2224-74e0-4a83-8aec-90cfb1d96a2e",
        price: 100,
        description: "Special rock performance for our first customers!",
      },
      {
        id: "3cd7e8f5-9b9d-43d2-b5a3-038b8a2c4b3e",
        bandId: "2b7e3d4a-8749-4c3c-b6f5-172c1a6c8e62",
        price: 120,
        description: "Exclusive jazz night experience!",
      },
    ],
  });

  await prisma.booking.createMany({
    data: [
      {
        id: "0eb627aa-3dc5-44b8-b395-2774defb0d74",
        offerId: "db0185c6-6a12-4825-9620-c13b8bde082e",
        userId: "0e3d0435-b60c-433f-bc5d-2c4e18c94fdc",
        status: "ACCEPTED",
        date: new Date("2025-03-22 20:00:00.000"),
      },
      {
        id: "a8f75d13-2fd9-4e3f-8394-d83f3f981b8a",
        offerId: "3cd7e8f5-9b9d-43d2-b5a3-038b8a2c4b3e",
        userId: "ad1c5d2a-49c8-4b0e-9d93-92d5ad728c13",
        status: "PENDING",
        date: new Date("2025-04-10 19:00:00.000"),
      },
    ],
  });

  await prisma.chat.create({
    data: {
      id: "6f258d1d-9448-44f7-b1b5-047b1976ee16",
      userId: "0e3d0435-b60c-433f-bc5d-2c4e18c94fdc",
      bandId: "63ae2224-74e0-4a83-8aec-90cfb1d96a2e",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        id: "467d2a4b-b2cd-49d5-8441-bd6c41825c61",
        senderId: "0e3d0435-b60c-433f-bc5d-2c4e18c94fdc",
        recipientId: "63ae2224-74e0-4a83-8aec-90cfb1d96a2e",
        chatId: "6f258d1d-9448-44f7-b1b5-047b1976ee16",
        content: "Hey, I am interested in your band!",
        isRead: true,
      },
      {
        id: "c7723dcd-f3e7-4384-a6c5-33155cca3acd",
        senderId: "63ae2224-74e0-4a83-8aec-90cfb1d96a2e",
        recipientId: "0e3d0435-b60c-433f-bc5d-2c4e18c94fdc",
        chatId: "6f258d1d-9448-44f7-b1b5-047b1976ee16",
        content: "Thanks for reaching out! Let me know how I can help.",
        isRead: true,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
