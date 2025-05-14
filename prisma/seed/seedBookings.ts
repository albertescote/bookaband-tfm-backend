import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedBookings() {
  await prisma.booking.create({
    data: {
      id: "005a9a95-8b56-4560-99d9-f5643fde687c",
      offerId: "c4c926ff-24d1-47d8-af6e-c7a179f1f363",
      userId: "bb496cb6-15d3-4739-93bf-4a790f0668f2",
      status: "ACCEPTED",
      date: new Date("2025-07-10T20:00:00.000Z"),
    },
  });
  await prisma.booking.create({
    data: {
      id: "ba25f50d-6b50-4843-8ae7-e1c989779444",
      offerId: "5acd3dca-472b-4526-9ff0-981fed60ed2b",
      userId: "8dea1067-4b61-4863-984a-8e665664eb14",
      status: "PENDING",
      date: new Date("2025-07-11T20:00:00.000Z"),
    },
  });
  await prisma.booking.create({
    data: {
      id: "f267fc58-5472-4b9a-800a-c67cbc648083",
      offerId: "b231ecbf-9053-41ef-87c4-0352a3fa178f",
      userId: "23c678d2-2137-4758-bfc3-4a26afcd38c3",
      status: "ACCEPTED",
      date: new Date("2025-07-12T20:00:00.000Z"),
    },
  });
  await prisma.booking.create({
    data: {
      id: "e3c6fa0d-9966-431c-8c6f-aeba5d3ec507",
      offerId: "bd2a1f30-15f2-4cbb-8e6f-e20183226d0f",
      userId: "4bd0a013-2fa9-48ba-9d18-de3fdc17341f",
      status: "DECLINED",
      date: new Date("2025-07-13T20:00:00.000Z"),
    },
  });
  await prisma.booking.create({
    data: {
      id: "a1083d79-4e08-4768-987b-e33060f6ac82",
      offerId: "28799971-dd1a-4818-b060-7df8ddc2e178",
      userId: "6239f3c2-7cc3-4886-af60-abc41e5d4e2e",
      status: "PENDING",
      date: new Date("2025-07-14T20:00:00.000Z"),
    },
  });
  await prisma.booking.create({
    data: {
      id: "f7e36886-2ba4-4d2a-a071-d1bc0c7254c3",
      offerId: "ccbe78f3-55cf-4411-a801-f59614e6fa4e",
      userId: "3ca4cdcc-57a3-439e-9897-bb2fcda482b3",
      status: "ACCEPTED",
      date: new Date("2025-07-15T20:00:00.000Z"),
    },
  });
}
