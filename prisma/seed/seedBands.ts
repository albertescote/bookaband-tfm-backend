import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedBands() {
  await prisma.band.create({
    data: {
      id: "b4ed7600-12da-4673-960d-ff29af2606db",
      name: "The Electric Waves",
      genre: "Electronic",
      imageUrl:
        "https://images.pexels.com/photos/12250627/pexels-photo-12250627.jpeg",
      rating: 4.5,
      reviewCount: 30,
      members: {
        connect: [{ id: "f2f272b4-e902-4677-a709-ab333e3d280c" }],
      },
    },
  });
  await prisma.band.create({
    data: {
      id: "824863a8-1e09-4d69-9e5d-8e0bff068129",
      name: "Sax & Soul",
      genre: "Jazz",
      imageUrl:
        "https://images.pexels.com/photos/3018075/pexels-photo-3018075.jpeg",
      rating: 4.6,
      reviewCount: 40,
      members: {
        connect: [{ id: "892b48de-a91a-4c30-9c89-3162f7aa815c" }],
      },
    },
  });
  await prisma.band.create({
    data: {
      id: "eef58ab1-c216-4d23-81cd-432ab1637caa",
      name: "Los Mariachis del Sol",
      genre: "Latin",
      imageUrl:
        "https://images.pexels.com/photos/8639009/pexels-photo-8639009.jpeg",
      rating: 4.7,
      reviewCount: 50,
      members: {
        connect: [{ id: "f268b4b2-9146-4f60-8cce-96e6daae0d5d" }],
      },
    },
  });
  await prisma.band.create({
    data: {
      id: "0795cc24-7738-4ab4-8e1c-510d30c32c86",
      name: "Clásicos de Cámara",
      genre: "Classical",
      imageUrl:
        "https://images.pexels.com/photos/3769099/pexels-photo-3769099.jpeg",
      rating: 4.8,
      reviewCount: 60,
      members: {
        connect: [{ id: "995cf05d-f641-4874-8bed-31742212cddd" }],
      },
    },
  });
  await prisma.band.create({
    data: {
      id: "2f71420b-c2ed-4eed-a8c6-02a061b95958",
      name: "Funkadelic Vibes",
      genre: "Funk",
      imageUrl:
        "https://images.pexels.com/photos/1365167/pexels-photo-1365167.jpeg",
      rating: 4.9,
      reviewCount: 70,
      members: {
        connect: [{ id: "97295898-f96d-4e30-b706-38c351165d0c" }],
      },
    },
  });
  await prisma.band.create({
    data: {
      id: "724382b4-6878-4f84-b177-9668b88cc6d9",
      name: "Midnight Rockers",
      genre: "Rock",
      imageUrl:
        "https://images.pexels.com/photos/3807093/pexels-photo-3807093.jpeg",
      rating: 5.0,
      reviewCount: 80,
      members: {
        connect: [{ id: "1eb2a6cf-0102-4b93-84e5-69d9a26ab519" }],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "f5e06fc0-9a0e-4f53-a447-0374e9cb12c5",
      name: "Indie Lights",
      genre: "Indie",
      imageUrl:
        "https://images.pexels.com/photos/1778810/pexels-photo-1778810.jpeg",
      rating: 4.4,
      reviewCount: 25,
      members: {
        connect: [{ id: "892b48de-a91a-4c30-9c89-3162f7aa815c" }],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "e4d27d4f-7701-4e60-bc4f-77773c2c16fc",
      name: "Groove Collective",
      genre: "Soul",
      imageUrl:
        "https://images.pexels.com/photos/9009561/pexels-photo-9009561.jpeg",
      rating: 4.3,
      reviewCount: 18,
      members: {
        connect: [{ id: "bb496cb6-15d3-4739-93bf-4a790f0668f2" }],
      },
    },
  });

  await prisma.band.create({
    data: {
      id: "aac0e317-f109-4cd0-9b6d-342b41cf1b9e",
      name: "The Neo Classics",
      genre: "Neo-Soul",
      imageUrl:
        "https://images.pexels.com/photos/6031335/pexels-photo-6031335.jpeg",
      rating: 4.6,
      reviewCount: 32,
      members: {
        connect: [{ id: "f2f272b4-e902-4677-a709-ab333e3d280c" }],
      },
    },
  });
}
