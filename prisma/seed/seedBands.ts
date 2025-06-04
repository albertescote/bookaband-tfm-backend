import { PrismaClient } from "@prisma/client";
import { BandRole } from "../../src/context/band/domain/bandRole";
import { BandSize } from "../../src/context/band/domain/bandSize";

const prisma = new PrismaClient();

export async function seedBands() {
  await prisma.band.create({
    data: {
      id: "b4ed7600-12da-4673-960d-ff29af2606db",
      name: "The Electric Waves",
      musicalStyleIds: [
        "a7b8c9d0-e1f2-0a1b-4c3d-5e6f7a8b9c0d",
        "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
      ],
      imageUrl:
        "https://images.pexels.com/photos/12250627/pexels-photo-12250627.jpeg",
      bio: "An electrifying experience of synths and beats.",
      followers: 1200,
      following: 85,
      createdAt: new Date(),
      price: 1500,
      location: "Barcelona",
      bandSize: BandSize.BAND,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
      ],
      featured: true,
      visible: true,
      weeklyAvailability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
      hospitalityRider: {
        create: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
      },
      technicalRider: {
        create: {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      },
      performanceArea: {
        create: {
          regions: ["Catalonia", "Valencia", "Balearic Islands"],
          travelPreferences: "Prefer venues within 200km radius",
          restrictions: "No outdoor events during winter",
        },
      },
      members: {
        create: [
          {
            user: { connect: { id: "f2f272b4-e902-4677-a709-ab333e3d280c" } },
            role: BandRole.ADMIN,
          },
        ],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "824863a8-1e09-4d69-9e5d-8e0bff068129",
      name: "Sax & Soul",
      musicalStyleIds: [
        "c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f",
        "d4e5f6a7-b8c9-7d8e-1f0a-2b3c4d5e6f7a",
      ],
      imageUrl:
        "https://images.pexels.com/photos/3018075/pexels-photo-3018075.jpeg",
      bio: "Smooth jazz vibes with soulful improvisations.",
      followers: 980,
      following: 60,
      createdAt: new Date(),
      price: 2000,
      location: "Madrid",
      bandSize: BandSize.TRIO,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
      ],
      featured: true,
      visible: true,
      weeklyAvailability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
      hospitalityRider: {
        create: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Allergic to nuts",
        },
      },
      technicalRider: {
        create: {
          soundSystem: "Professional PA system",
          microphones: "4 microphones",
          backline: "Piano, bass, drums",
          lighting: "Stage lighting",
          otherRequirements: "Piano tuning required",
        },
      },
      performanceArea: {
        create: {
          regions: ["Madrid", "Castilla y León", "Castilla-La Mancha"],
          travelPreferences: "Prefer venues within 150km radius",
          restrictions: "No outdoor events during summer",
        },
      },
      members: {
        create: [
          {
            user: { connect: { id: "892b48de-a91a-4c30-9c89-3162f7aa815c" } },
            role: BandRole.ADMIN,
          },
        ],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "eef58ab1-c216-4d23-81cd-432ab1637caa",
      name: "Los Mariachis del Sol",
      musicalStyleIds: [
        "e5f6a7b8-c9d0-8e9f-2a1b-3c4d5e6f7a8b",
        "d0e1f2a3-b4c5-3d4e-7f6a-8b9c0d1e2f3a",
      ],
      imageUrl:
        "https://images.pexels.com/photos/8639009/pexels-photo-8639009.jpeg",
      bio: "Traditional Mexican music with a modern twist.",
      followers: 1500,
      following: 40,
      createdAt: new Date(),
      price: 1800,
      location: "Valencia",
      bandSize: BandSize.BAND,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
      ],
      featured: true,
      visible: true,
      weeklyAvailability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
      hospitalityRider: {
        create: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Traditional Mexican food preferred",
        },
      },
      technicalRider: {
        create: {
          soundSystem: "Professional PA system",
          microphones: "6 microphones",
          backline: "Traditional instruments provided",
          lighting: "Stage lighting",
          otherRequirements: "Outdoor performance space preferred",
        },
      },
      performanceArea: {
        create: {
          regions: ["Valencia", "Murcia", "Alicante"],
          travelPreferences: "Prefer venues within 100km radius",
          restrictions: "No indoor venues without proper ventilation",
        },
      },
      members: {
        create: [
          {
            user: { connect: { id: "f268b4b2-9146-4f60-8cce-96e6daae0d5d" } },
            role: BandRole.ADMIN,
          },
        ],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "0795cc24-7738-4ab4-8e1c-510d30c32c86",
      name: "Clásicos de Cámara",
      musicalStyleIds: [
        "f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c",
        "c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f",
      ],
      imageUrl:
        "https://images.pexels.com/photos/3769099/pexels-photo-3769099.jpeg",
      bio: "Chamber music at its finest, blending strings and soul.",
      followers: 800,
      following: 35,
      createdAt: new Date(),
      price: 1200,
      location: "Barcelona",
      bandSize: BandSize.TRIO,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
      ],
      featured: true,
      visible: true,
      weeklyAvailability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
      hospitalityRider: {
        create: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
      },
      technicalRider: {
        create: {
          soundSystem: "Professional PA system",
          microphones: "2 microphones",
          backline: "String instruments",
          lighting: "Stage lighting",
          otherRequirements: "No loud amplification",
        },
      },
      performanceArea: {
        create: {
          regions: ["Barcelona", "Tarragona", "Girona"],
          travelPreferences: "Prefer venues within 100km radius",
          restrictions: "No outdoor events during winter",
        },
      },
      members: {
        create: [
          {
            user: { connect: { id: "995cf05d-f641-4874-8bed-31742212cddd" } },
            role: BandRole.ADMIN,
          },
        ],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "2f71420b-c2ed-4eed-a8c6-02a061b95958",
      name: "Funkadelic Vibes",
      musicalStyleIds: [
        "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
        "c9d0e1f2-a3b4-2c3d-6e5f-7a8b9c0d1e2f",
      ],
      imageUrl:
        "https://images.pexels.com/photos/1365167/pexels-photo-1365167.jpeg",
      bio: "Booty-shaking funk grooves from the underground.",
      followers: 2000,
      following: 90,
      createdAt: new Date(),
      price: 2500,
      location: "Madrid",
      bandSize: BandSize.BAND,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
      ],
      featured: true,
      visible: true,
      weeklyAvailability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
      hospitalityRider: {
        create: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Allergic to nuts",
        },
      },
      technicalRider: {
        create: {
          soundSystem: "Professional PA system",
          microphones: "8 microphones",
          backline: "Bass, drums, keyboards",
          lighting: "Stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      },
      performanceArea: {
        create: {
          regions: ["Madrid", "Castilla y León", "Castilla-La Mancha"],
          travelPreferences: "Prefer venues within 150km radius",
          restrictions: "No outdoor events during summer",
        },
      },
      members: {
        create: [
          {
            user: { connect: { id: "97295898-f96d-4e30-b706-38c351165d0c" } },
            role: BandRole.ADMIN,
          },
        ],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "724382b4-6878-4f84-b177-9668b88cc6d9",
      name: "Midnight Rockers",
      musicalStyleIds: [
        "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
        "b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e",
      ],
      imageUrl:
        "https://images.pexels.com/photos/3807093/pexels-photo-3807093.jpeg",
      bio: "Late-night rock anthems that shake the stage.",
      followers: 2500,
      following: 100,
      createdAt: new Date(),
      price: 3000,
      location: "Barcelona",
      bandSize: BandSize.BAND,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
      ],
      featured: true,
      visible: true,
      weeklyAvailability: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: true,
        saturday: true,
        sunday: true,
      },
      hospitalityRider: {
        create: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Allergic to nuts",
        },
      },
      technicalRider: {
        create: {
          soundSystem: "Professional PA system",
          microphones: "10 microphones",
          backline: "Guitars, bass, drums",
          lighting: "Stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      },
      performanceArea: {
        create: {
          regions: ["Barcelona", "Tarragona", "Girona"],
          travelPreferences: "Prefer venues within 100km radius",
          restrictions: "No outdoor events during winter",
        },
      },
      members: {
        create: [
          {
            user: { connect: { id: "1eb2a6cf-0102-4b93-84e5-69d9a26ab519" } },
            role: BandRole.ADMIN,
          },
        ],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "f5e06fc0-9a0e-4f53-a447-0374e9cb12c5",
      name: "Indie Lights",
      musicalStyleIds: [
        "b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e",
        "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
      ],
      imageUrl:
        "https://images.pexels.com/photos/1778810/pexels-photo-1778810.jpeg",
      bio: "Introspective indie tunes with shimmering guitars.",
      followers: 1100,
      following: 70,
      createdAt: new Date(),
      price: 1000,
      location: "Barcelona",
      bandSize: BandSize.TRIO,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
      ],
      featured: true,
      visible: true,
      weeklyAvailability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
      hospitalityRider: {
        create: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
      },
      technicalRider: {
        create: {
          soundSystem: "Professional PA system",
          microphones: "2 microphones",
          backline: "Guitars, bass",
          lighting: "Stage lighting",
          otherRequirements: "No loud amplification",
        },
      },
      performanceArea: {
        create: {
          regions: ["Barcelona", "Tarragona", "Girona"],
          travelPreferences: "Prefer venues within 100km radius",
          restrictions: "No outdoor events during winter",
        },
      },
      members: {
        create: [
          {
            user: { connect: { id: "892b48de-a91a-4c30-9c89-3162f7aa815c" } },
            role: BandRole.ADMIN,
          },
        ],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "e4d27d4f-7701-4e60-bc4f-77773c2c16fc",
      name: "Groove Collective",
      musicalStyleIds: [
        "c9d0e1f2-a3b4-2c3d-6e5f-7a8b9c0d1e2f",
        "b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e",
      ],
      imageUrl:
        "https://images.pexels.com/photos/9009561/pexels-photo-9009561.jpeg",
      bio: "A collective of groovers playing soulful tunes.",
      followers: 760,
      following: 42,
      createdAt: new Date(),
      price: 1500,
      location: "Madrid",
      bandSize: BandSize.BAND,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
      ],
      featured: true,
      visible: true,
      weeklyAvailability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
      hospitalityRider: {
        create: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
      },
      technicalRider: {
        create: {
          soundSystem: "Professional PA system",
          microphones: "4 microphones",
          backline: "Bass, drums",
          lighting: "Stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      },
      performanceArea: {
        create: {
          regions: ["Madrid", "Castilla y León", "Castilla-La Mancha"],
          travelPreferences: "Prefer venues within 150km radius",
          restrictions: "No outdoor events during summer",
        },
      },
      members: {
        create: [
          {
            user: { connect: { id: "bb496cb6-15d3-4739-93bf-4a790f0668f2" } },
            role: BandRole.ADMIN,
          },
        ],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "aac0e317-f109-4cd0-9b6d-342b41cf1b9e",
      name: "The Neo Classics",
      musicalStyleIds: [
        "c9d0e1f2-a3b4-2c3d-6e5f-7a8b9c0d1e2f",
        "f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c",
      ],
      imageUrl:
        "https://images.pexels.com/photos/6031335/pexels-photo-6031335.jpeg",
      bio: "Classic soul reimagined for the modern era.",
      followers: 1340,
      following: 58,
      createdAt: new Date(),
      price: 2000,
      location: "Barcelona",
      bandSize: BandSize.TRIO,
      eventTypeIds: [
        "680e3e8f-8e08-4921-8461-0f60971c8b5f",
        "7c223ed2-e955-4007-ac8a-f23235127ac5",
        "ec30f141-5914-46e3-a482-39d55a097e9b",
      ],
      featured: true,
      visible: true,
      weeklyAvailability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
      },
      hospitalityRider: {
        create: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
      },
      technicalRider: {
        create: {
          soundSystem: "Professional PA system",
          microphones: "2 microphones",
          backline: "Bass, keyboards",
          lighting: "Stage lighting",
          otherRequirements: "No loud amplification",
        },
      },
      performanceArea: {
        create: {
          regions: ["Barcelona", "Tarragona", "Girona"],
          travelPreferences: "Prefer venues within 100km radius",
          restrictions: "No outdoor events during winter",
        },
      },
      members: {
        create: [
          {
            user: { connect: { id: "f2f272b4-e902-4677-a709-ab333e3d280c" } },
            role: BandRole.ADMIN,
          },
        ],
      },
    },
  });
}
