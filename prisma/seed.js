const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const musician = await prisma.user.create({
    data: {
      id: "8721e564-997d-47cd-8d46-6a41e468dadb",
      firstName: "John",
      familyName: "Doe",
      email: "john.doe@example.com",
      password: "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
      role: "Musician",
      imageUrl:
        "https://img.freepik.com/foto-gratis/joven-barbudo-camisa_273609-5938.jpg",
    },
  });

  const client = await prisma.user.create({
    data: {
      id: "0e3d0435-b60c-433f-bc5d-2c4e18c94fdc",
      firstName: "Jane",
      familyName: "Smith",
      email: "jane.smith@example.com",
      password: "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
      role: "Client",
      imageUrl:
        "https://img.freepik.com/foto-gratis/retrato-mujer_23-2147626503.jpg",
    },
  });

  const band = await prisma.band.create({
    data: {
      id: "63ae2224-74e0-4a83-8aec-90cfb1d96a2e",
      name: "Default Band",
      genre: "ROCK",
      imageUrl:
        "https://img.freepik.com/free-vector/illustration-rock-band_23-2149593909.jpg",
      members: {
        connect: { id: musician.id },
      },
    },
  });

  const offer = await prisma.offer.create({
    data: {
      id: "db0185c6-6a12-4825-9620-c13b8bde082e",
      bandId: band.id,
      price: 100,
      description: "Special offer for our first customers!",
    },
  });

  const chat = await prisma.chat.create({
    data: {
      id: "6f258d1d-9448-44f7-b1b5-047b1976ee16",
      userId: client.id,
      bandId: band.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        id: "467d2a4b-b2cd-49d5-8441-bd6c41825c61",
        senderId: client.id,
        recipientId: band.id,
        chatId: chat.id,
        content: "Hey, I am interested in your band!",
        isRead: true,
      },
      {
        id: "c7723dcd-f3e7-4384-a6c5-33155cca3acd",
        senderId: band.id,
        recipientId: client.id,
        chatId: chat.id,
        content: "Thanks for reaching out! Let me know how I can help.",
        isRead: true,
      },
    ],
  });

  await prisma.booking.create({
    data: {
      id: "0eb627aa-3dc5-44b8-b395-2774defb0d74",
      offerId: offer.id,
      userId: client.id,
      status: "ACCEPTED",
      date: "2025-03-22 20:00:00.000",
    },
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
