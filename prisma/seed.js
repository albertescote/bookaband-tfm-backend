const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function insertFeaturedArtists() {
  const featuredMusicians = [
    {
      user: {
        id: "b86ba6cb-71a9-4e8b-92de-7007379aed70",
        firstName: "Alex",
        familyName: "Romero",
        email: "alex.romero@example.com",
        imageUrl:
          "https://images.pexels.com/photos/12250627/pexels-photo-12250627.jpeg",
      },
      bandId: "5448f0c7-05ed-4720-991a-043c06d088bc",
      offerId: "ff88067f-aef5-4b4c-889f-2eba40b87589",
      genre: "Techno",
      description:
        "DJ especializado en ritmos electrónicos intensos y atmósferas hipnóticas.",
      bandName: "Alex Romero",
      location: "Ibiza",
      price: 300,
    },
    {
      user: {
        id: "6313fa47-f3f6-4eb3-9f5d-50aea8a21ca9",
        firstName: "James",
        familyName: "Reed",
        email: "james.reed@example.com",
        imageUrl:
          "https://images.pexels.com/photos/3018075/pexels-photo-3018075.jpeg",
      },
      bandId: "78f5162a-194a-40a0-8ec9-6152ba6d272e",
      offerId: "2986e0a1-0556-4cca-806c-a6448bdb4d33",
      genre: "Jazz",
      description: "Cautiva al público con melodías suaves.",
      bandName: "James Reed Quartet",
      location: "Valencia",
      price: 250,
    },
    {
      user: {
        id: "99f6c413-5981-483c-8907-854c921843fb",
        firstName: "Sophia",
        familyName: "Lane",
        email: "sophia.lane@example.com",
        imageUrl:
          "https://images.pexels.com/photos/8041144/pexels-photo-8041144.jpeg",
      },
      bandId: "5c9a6f36-8343-4591-ba36-63f18a267a41",
      offerId: "cb910337-a270-465e-ad74-941db7f95c35",
      genre: "Pop",
      description: "Crea melodías pegajosas y ritmos dinámicos.",
      bandName: "Sophia Lane",
      location: "Madrid",
      price: 400,
    },
    {
      user: {
        id: "8d5b4a62-d5e2-4e76-8ad3-a1b9f3870d13",
        firstName: "Leo",
        familyName: "Martinez",
        email: "leo.martinez@example.com",
        imageUrl:
          "https://images.pexels.com/photos/1365167/pexels-photo-1365167.jpeg",
      },
      bandId: "f2a7c3e4-1e48-42c6-9014-fbb50dc97b9c",
      offerId: "d4f5c6a7-13c8-4f69-9f02-bf5e7c189822",
      genre: "Jazz",
      description: "Improvisación elegante con un toque moderno.",
      bandName: "Leo & The Groove",
      location: "Valencia",
      price: 550,
    },
    {
      user: {
        id: "7b4f3e29-b10d-43f5-ae6e-2b78a8c927f4",
        firstName: "Clara",
        familyName: "Ríos",
        email: "clara.rios@example.com",
        imageUrl:
          "https://images.pexels.com/photos/3769099/pexels-photo-3769099.jpeg",
      },
      bandId: "a9e1d2f3-51b9-49b8-afe2-33c7a6a77a2c",
      offerId: "b3d48a62-88e5-4b93-87cf-18e19b49fc0c",
      genre: "Rock",
      description: "Energía en vivo con clásicos y temas originales.",
      bandName: "Clara Ríos Band",
      location: "Barcelona",
      price: 600,
    },
  ];

  for (const musician of featuredMusicians) {
    const {
      user,
      genre,
      description,
      bandName,
      location,
      price,
      bandId,
      offerId,
    } = musician;

    await prisma.user.create({
      data: {
        ...user,
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2", // default hash
        role: "Musician",
      },
    });

    await prisma.band.create({
      data: {
        id: bandId,
        name: bandName,
        genre,
        imageUrl: user.imageUrl,
        rating: 4.7,
        reviewCount: 30,
        members: {
          connect: [{ id: user.id }],
        },
      },
    });

    await prisma.offer.create({
      data: {
        id: offerId,
        bandId: bandId,
        price,
        location,
        description,
        featured: true,
        visible: true,
        bandSize: "solo",
        equipment: {
          create: [{ type: "sound" }, { type: "microphone" }],
        },
        eventTypeIds: [
          "680e3e8f-8e08-4921-8461-0f60971c8b5f",
          "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
        ],
      },
    });
  }
}

async function main() {
  await insertFeaturedArtists();

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
          "https://img.freepik.com/free-photo/young-beautiful-blonde-woman-wearing-casual-striped-tshirt-isolated-white-background-looking-away-side-with-smile-face-natural-expression-laughing-confident_839833-30463.jpg",
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
          "https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed-holding-white-headphone-around-his-neck_23-2148096439.jpg",
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
          "https://img.freepik.com/free-photo/front-view-beautiful-man_23-2148780802.jpg",
      },
    ],
  });

  // Create bands
  await prisma.band.create({
    data: {
      id: "63ae2224-74e0-4a83-8aec-90cfb1d96a2e",
      name: "Rock Legends",
      genre: "rock",
      imageUrl:
        "https://img.freepik.com/free-photo/music-band-guitarist-performing-repetition-recording-studio_53876-138054.jpg",
      rating: 4.5,
      reviewCount: 88,
      members: { connect: [{ id: "8721e564-997d-47cd-8d46-6a41e468dadb" }] },
    },
  });

  await prisma.band.create({
    data: {
      id: "80cead79-df8a-4c8a-a08b-d187e718d71e",
      name: "Pop Icons",
      genre: "pop",
      imageUrl:
        "https://img.freepik.com/free-photo/band-musicians-playing-music-local-event_23-2149188063.jpg",
      rating: 4.8,
      reviewCount: 102,
      members: { connect: [{ id: "5cbbf2a4-7cf4-482d-8b96-940ecdfcc9fc" }] },
    },
  });

  await prisma.band.create({
    data: {
      id: "2b7e3d4a-8749-4c3c-b6f5-172c1a6c8e62",
      name: "Jazz Masters",
      genre: "jazz",
      imageUrl:
        "https://img.freepik.com/free-photo/medium-shot-people-playing-together_23-2149223634.jpg",
      rating: 4.6,
      reviewCount: 95,
      members: { connect: [{ id: "bf9ef9b4-f46e-47b8-b2b1-12f8b12433bb" }] },
    },
  });

  // Create offers with new schema
  await prisma.offer.create({
    data: {
      id: "db0185c6-6a12-4825-9620-c13b8bde082e",
      bandId: "63ae2224-74e0-4a83-8aec-90cfb1d96a2e",
      price: 100,
      location: "Barcelona",
      description: "Special rock performance for our first customers!",
      featured: true,
      bandSize: "band",
      visible: true,
      equipment: {
        create: [
          { type: "sound" },
          { type: "lighting" },
          { type: "microphone" },
        ],
      },
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
      ],
    },
  });

  await prisma.offer.create({
    data: {
      id: "3cd7e8f5-9b9d-43d2-b5a3-038b8a2c4b3e",
      bandId: "2b7e3d4a-8749-4c3c-b6f5-172c1a6c8e62",
      price: 120,
      location: "Seville",
      description: "Exclusive jazz night experience!",
      featured: false,
      bandSize: "trio",
      visible: true,
      equipment: {
        create: [{ type: "sound" }, { type: "microphone" }],
      },
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
        "d28c8f50-ef20-4e23-9992-1a6f1e540a09",
        "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
      ],
    },
  });

  await prisma.offer.create({
    data: {
      id: "29f0d965-864a-4187-9189-6a3b243a7b65",
      bandId: "80cead79-df8a-4c8a-a08b-d187e718d71e",
      price: 500,
      location: "Madrid",
      description: "Pop night package with full lighting",
      featured: false,
      bandSize: "duo",
      visible: true,
    },
  });

  // Bookings
  await prisma.booking.createMany({
    data: [
      {
        id: "0eb627aa-3dc5-44b8-b395-2774defb0d74",
        offerId: "db0185c6-6a12-4825-9620-c13b8bde082e",
        userId: "0e3d0435-b60c-433f-bc5d-2c4e18c94fdc",
        status: "ACCEPTED",
        date: new Date("2025-03-22T20:00:00.000Z"),
      },
      {
        id: "a8f75d13-2fd9-4e3f-8394-d83f3f981b8a",
        offerId: "3cd7e8f5-9b9d-43d2-b5a3-038b8a2c4b3e",
        userId: "ad1c5d2a-49c8-4b0e-9d93-92d5ad728c13",
        status: "PENDING",
        date: new Date("2025-04-10T19:00:00.000Z"),
      },
    ],
  });

  // Chat & messages
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

  // Email verifications
  await prisma.emailVerification.createMany({
    data: [
      {
        id: "01ea885c-f3e5-47c3-a2ed-3b4a59dc2a01",
        userId: "8721e564-997d-47cd-8d46-6a41e468dadb", // John
        language: "en",
        verified: false,
        lastEmailSentAt: new Date(),
      },
      {
        id: "c33dc66a-34be-4c37-a862-f63d69fc51bc",
        userId: "bf9ef9b4-f46e-47b8-b2b1-12f8b12433bb", // Alice
        language: "ca",
        verified: true,
        lastEmailSentAt: new Date(),
      },
      {
        id: "9670f50f-79a5-4ef0-a9d1-cfe6a99a3cd2",
        userId: "5cbbf2a4-7cf4-482d-8b96-940ecdfcc9fc", // Mike
        language: "es",
        verified: true,
        lastEmailSentAt: new Date(),
      },
      {
        id: "7cc2d89b-28ed-4a75-ae61-39bd7753215d",
        userId: "0e3d0435-b60c-433f-bc5d-2c4e18c94fdc", // Jane
        language: "en",
        verified: true,
        lastEmailSentAt: new Date(),
      },
      {
        id: "c4529659-718d-4d89-a41e-e64a9b1c8ec2",
        userId: "ad1c5d2a-49c8-4b0e-9d93-92d5ad728c13", // Emma
        language: "ca",
        verified: true,
        lastEmailSentAt: new Date(),
      },
    ],
  });

  console.log("✅ Database seeded successfully with the updated schema!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
