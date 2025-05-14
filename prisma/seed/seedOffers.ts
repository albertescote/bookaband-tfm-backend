import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedOffers() {
  await prisma.offer.create({
    data: {
      id: "c4c926ff-24d1-47d8-af6e-c7a179f1f363",
      bandId: "b4ed7600-12da-4673-960d-ff29af2606db",
      price: 300,
      location: "Ibiza",
      description: "High-energy electronic DJ set for club nights.",
      featured: true,
      bandSize: "band",
      visible: true,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
      ],
      equipment: {
        create: [{ type: "sound" }, { type: "microphone" }],
      },
    },
  });
  await prisma.offer.create({
    data: {
      id: "5acd3dca-472b-4526-9ff0-981fed60ed2b",
      bandId: "824863a8-1e09-4d69-9e5d-8e0bff068129",
      price: 350,
      location: "Madrid",
      description: "Smooth jazz quartet for elegant events.",
      featured: false,
      bandSize: "band",
      visible: true,
      eventTypeIds: [
        "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
      ],
      equipment: {
        create: [{ type: "sound" }, { type: "microphone" }],
      },
    },
  });
  await prisma.offer.create({
    data: {
      id: "b231ecbf-9053-41ef-87c4-0352a3fa178f",
      bandId: "eef58ab1-c216-4d23-81cd-432ab1637caa",
      price: 400,
      location: "Valencia",
      description: "Authentic mariachi performance for weddings and parties.",
      featured: true,
      bandSize: "band",
      visible: true,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "d28c8f50-ef20-4e23-9992-1a6f1e540a09",
      ],
      equipment: {
        create: [{ type: "sound" }, { type: "microphone" }],
      },
    },
  });
  await prisma.offer.create({
    data: {
      id: "bd2a1f30-15f2-4cbb-8e6f-e20183226d0f",
      bandId: "0795cc24-7738-4ab4-8e1c-510d30c32c86",
      price: 450,
      location: "Seville",
      description: "Classical music for formal ceremonies.",
      featured: false,
      bandSize: "band",
      visible: true,
      eventTypeIds: [
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
      ],
      equipment: {
        create: [{ type: "sound" }, { type: "microphone" }],
      },
    },
  });
  await prisma.offer.create({
    data: {
      id: "28799971-dd1a-4818-b060-7df8ddc2e178",
      bandId: "2f71420b-c2ed-4eed-a8c6-02a061b95958",
      price: 500,
      location: "Barcelona",
      description: "Funky grooves and danceable rhythms.",
      featured: true,
      bandSize: "band",
      visible: true,
      eventTypeIds: [
        "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
      ],
      equipment: {
        create: [{ type: "sound" }, { type: "microphone" }],
      },
    },
  });
  await prisma.offer.create({
    data: {
      id: "ccbe78f3-55cf-4411-a801-f59614e6fa4e",
      bandId: "724382b4-6878-4f84-b177-9668b88cc6d9",
      price: 550,
      location: "Granada",
      description: "Powerful rock anthems and originals.",
      featured: false,
      bandSize: "band",
      visible: true,
      eventTypeIds: [
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
      ],
      equipment: {
        create: [{ type: "sound" }, { type: "microphone" }],
      },
    },
  });

  await prisma.offer.create({
    data: {
      id: "3e6af3d9-4905-4d9e-a890-8bdf6973fdf0",
      bandId: "f5e06fc0-9a0e-4f53-a447-0374e9cb12c5",
      price: 380,
      location: "Bilbao",
      description: "Indie vibes perfect for cozy and stylish venues.",
      featured: true,
      visible: true,
      bandSize: "quartet",
      eventTypeIds: [
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
      ],
      equipment: {
        create: [{ type: "sound" }, { type: "lighting" }],
      },
    },
  });

  await prisma.offer.create({
    data: {
      id: "6cfcab74-6d8e-4649-b9b4-e4a43a030702",
      bandId: "e4d27d4f-7701-4e60-bc4f-77773c2c16fc",
      price: 450,
      location: "Valencia",
      description: "Soulful sounds and funky rhythms for your event.",
      featured: true,
      visible: true,
      bandSize: "band",
      eventTypeIds: [
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
      ],
      equipment: {
        create: [{ type: "sound" }, { type: "microphone" }],
      },
    },
  });

  await prisma.offer.create({
    data: {
      id: "7be5b735-f6cb-49e6-ae8b-b1e3ebcf7c04",
      bandId: "aac0e317-f109-4cd0-9b6d-342b41cf1b9e",
      price: 520,
      location: "Barcelona",
      description: "Neo-soul groove with class and elegance.",
      featured: true,
      visible: true,
      bandSize: "duo",
      eventTypeIds: [
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
      ],
      equipment: {
        create: [{ type: "microphone" }],
      },
    },
  });
}
