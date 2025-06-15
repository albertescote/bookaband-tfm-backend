import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedBookings() {
  await prisma.booking.create({
    data: {
      id: "005a9a95-8b56-4560-99d9-f5643fde687c",
      bandId: "2f71420b-c2ed-4eed-a8c6-02a061b95958", // Funkadelic Vibes - corporate event
      userId: "bb496cb6-15d3-4739-93bf-4a790f0668f2",
      status: "ACCEPTED",
      name: "Corporate Summer Party",
      eventTypeId: "ec30f141-5914-46e3-a482-39d55a097e9b",
      initDate: new Date("2025-07-10T20:00:00.000Z"),
      endDate: new Date("2025-07-10T23:00:00.000Z"),
      country: "Germany",
      city: "Berlin",
      venue: "Sky Tower Rooftop",
      postalCode: "10115",
      addressLine1: "Alexanderplatz 1",
      addressLine2: "Floor 8",
      isPublic: true,
      cost: 4500,
    },
  });

  await prisma.booking.create({
    data: {
      id: "ba25f50d-6b50-4843-8ae7-e1c989779444",
      bandId: "b4ed7600-12da-4673-960d-ff29af2606db", // The Electric Waves - wedding event
      userId: "8dea1067-4b61-4863-984a-8e665664eb14",
      status: "PENDING",
      name: "J&A Wedding",
      eventTypeId: "680e3e8f-8e08-4921-8461-0f60971c8b5f",
      initDate: new Date("2025-07-11T20:00:00.000Z"),
      endDate: new Date("2025-07-11T23:00:00.000Z"),
      country: "Italy",
      city: "Florence",
      venue: "Villa di Maiano",
      postalCode: "50125",
      addressLine1: "Via Benedetto da Maiano 11",
      isPublic: false,
      cost: 4500,
    },
  });

  await prisma.booking.create({
    data: {
      id: "cb58f0ca-afd4-459f-b0e4-0a4e2d9a3511",
      bandId: "b4ed7600-12da-4673-960d-ff29af2606db", // The Electric Waves - festival event
      userId: "8dea1067-4b61-4863-984a-8e665664eb14",
      status: "ACCEPTED",
      name: "BeachFest",
      eventTypeId: "ec30f141-5914-46e3-a482-39d55a097e9b",
      initDate: new Date("2025-06-11T20:00:00.000Z"),
      endDate: new Date("2025-06-11T23:00:00.000Z"),
      country: "Italy",
      city: "Florence",
      venue: "Villa di Maiano",
      postalCode: "50125",
      addressLine1: "Via Benedetto da Maiano 11",
      isPublic: true,
      cost: 4500,
    },
  });

  await prisma.booking.create({
    data: {
      id: "ca37897a-18a9-4cc5-8ea6-14f51364c314",
      bandId: "b4ed7600-12da-4673-960d-ff29af2606db", // The Electric Waves - wedding event
      userId: "8dea1067-4b61-4863-984a-8e665664eb14",
      status: "ACCEPTED",
      name: "A&M Wedding",
      eventTypeId: "680e3e8f-8e08-4921-8461-0f60971c8b5f",
      initDate: new Date("2025-06-11T20:00:00.000Z"),
      endDate: new Date("2025-06-11T23:00:00.000Z"),
      country: "Italy",
      city: "Florence",
      venue: "Villa di Maiano",
      postalCode: "50125",
      addressLine1: "Via Benedetto da Maiano 11",
      isPublic: false,
      cost: 4500,
    },
  });

  await prisma.booking.create({
    data: {
      id: "7f848434-88fe-404e-9948-e2079e7d0e28",
      bandId: "b4ed7600-12da-4673-960d-ff29af2606db", // The Electric Waves - wedding event
      userId: "8dea1067-4b61-4863-984a-8e665664eb14",
      status: "ACCEPTED",
      name: "E&M Wedding",
      eventTypeId: "680e3e8f-8e08-4921-8461-0f60971c8b5f",
      initDate: new Date("2025-07-01T20:00:00.000Z"),
      endDate: new Date("2025-07-01T23:00:00.000Z"),
      country: "Italy",
      city: "Florence",
      venue: "Villa di Maiano",
      postalCode: "50125",
      addressLine1: "Via Benedetto da Maiano 11",
      isPublic: true,
      cost: 4500,
    },
  });

  await prisma.booking.create({
    data: {
      id: "ed4b2fb5-18a8-4357-9cda-b794650738e3",
      bandId: "b4ed7600-12da-4673-960d-ff29af2606db", // The Electric Waves - festival event
      userId: "8dea1067-4b61-4863-984a-8e665664eb14",
      status: "DECLINED",
      name: "MyTown Festival",
      eventTypeId: "ec30f141-5914-46e3-a482-39d55a097e9b",
      initDate: new Date("2025-07-06T20:00:00.000Z"),
      endDate: new Date("2025-07-06T23:00:00.000Z"),
      country: "Italy",
      city: "Florence",
      venue: "Villa di Maiano",
      postalCode: "50125",
      addressLine1: "Via Benedetto da Maiano 11",
      isPublic: true,
      cost: 4500,
    },
  });

  await prisma.booking.create({
    data: {
      id: "f267fc58-5472-4b9a-800a-c67cbc648083",
      bandId: "824863a8-1e09-4d69-9e5d-8e0bff068129", // Sax & Soul - jazz event
      userId: "23c678d2-2137-4758-bfc3-4a26afcd38c3",
      status: "ACCEPTED",
      name: "Jazz Night",
      eventTypeId: "7c223ed2-e955-4007-ac8a-f23235127ac5",
      initDate: new Date("2025-07-12T20:00:00.000Z"),
      endDate: new Date("2025-07-12T23:00:00.000Z"),
      country: "France",
      city: "Nice",
      venue: "Open Air Stage",
      postalCode: "06000",
      addressLine1: "Promenade des Anglais",
      isPublic: true,
      cost: 6000,
    },
  });

  await prisma.booking.create({
    data: {
      id: "e3c6fa0d-9966-431c-8c6f-aeba5d3ec507",
      bandId: "eef58ab1-c216-4d23-81cd-432ab1637caa", // Los Mariachis del Sol - private event
      userId: "4bd0a013-2fa9-48ba-9d18-de3fdc17341f",
      status: "DECLINED",
      name: "Private Anniversary Celebration",
      eventTypeId: "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
      initDate: new Date("2025-07-13T20:00:00.000Z"),
      endDate: new Date("2025-07-13T23:00:00.000Z"),
      country: "Spain",
      city: "Madrid",
      venue: "Casa Privada",
      postalCode: "28001",
      addressLine1: "Calle de Serrano 45",
      addressLine2: "Penthouse",
      isPublic: false,
      cost: 5400,
    },
  });

  await prisma.booking.create({
    data: {
      id: "a1083d79-4e08-4768-987b-e33060f6ac82",
      bandId: "724382b4-6878-4f84-b177-9668b88cc6d9", // Midnight Rockers - festival event
      userId: "6239f3c2-7cc3-4886-af60-abc41e5d4e2e",
      status: "PENDING",
      name: "Beach Birthday Bash",
      eventTypeId: "680e3e8f-8e08-4921-8461-0f60971c8b5f",
      initDate: new Date("2025-07-14T20:00:00.000Z"),
      endDate: new Date("2025-07-14T23:00:00.000Z"),
      country: "Portugal",
      city: "Lisbon",
      venue: "Praia da Luz",
      postalCode: "1200-123",
      addressLine1: "Avenida da Liberdade",
      isPublic: true,
      cost: 3600,
    },
  });

  await prisma.booking.create({
    data: {
      id: "f7e36886-2ba4-4d2a-a071-d1bc0c7254c3",
      bandId: "e4d27d4f-7701-4e60-bc4f-77773c2c16fc", // Groove Collective - corporate event
      userId: "3ca4cdcc-57a3-439e-9897-bb2fcda482b3",
      status: "ACCEPTED",
      name: "Local Community Concert",
      eventTypeId: "ec30f141-5914-46e3-a482-39d55a097e9b",
      initDate: new Date("2025-07-15T20:00:00.000Z"),
      endDate: new Date("2025-07-15T23:00:00.000Z"),
      country: "Netherlands",
      city: "Amsterdam",
      venue: "Museumplein",
      postalCode: "1071 DJ",
      addressLine1: "Museumplein 6",
      isPublic: true,
      cost: 3600,
    },
  });
}
