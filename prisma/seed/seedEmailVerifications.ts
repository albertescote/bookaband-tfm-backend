import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedEmailVerifications() {
  await prisma.emailVerification.createMany({
    data: [
      {
        id: "01ea885c-f3e5-47c3-a2ed-3b4a59dc2a01",
        userId: "bb496cb6-15d3-4739-93bf-4a790f0668f2", // Sofia
        language: "es",
        verified: true,
        lastEmailSentAt: new Date(),
      },
      {
        id: "c33dc66a-34be-4c37-a862-f63d69fc51bc",
        userId: "8dea1067-4b61-4863-984a-8e665664eb14", // Emma
        language: "en",
        verified: true,
        lastEmailSentAt: new Date(),
      },
      {
        id: "9670f50f-79a5-4ef0-a9d1-cfe6a99a3cd2",
        userId: "23c678d2-2137-4758-bfc3-4a26afcd38c3", // Lucía
        language: "es",
        verified: false,
        lastEmailSentAt: new Date(),
      },
      {
        id: "7cc2d89b-28ed-4a75-ae61-39bd7753215d",
        userId: "4bd0a013-2fa9-48ba-9d18-de3fdc17341f", // Isabella
        language: "ca",
        verified: true,
        lastEmailSentAt: new Date(),
      },
      {
        id: "c4529659-718d-4d89-a41e-e64a9b1c8ec2",
        userId: "6239f3c2-7cc3-4886-af60-abc41e5d4e2e", // Mia
        language: "en",
        verified: true,
        lastEmailSentAt: new Date(),
      },
      {
        id: "7a4e471b-c019-4f74-87ec-598bfe6ed91f",
        userId: "3ca4cdcc-57a3-439e-9897-bb2fcda482b3", // Valentina
        language: "es",
        verified: false,
        lastEmailSentAt: new Date(),
      },
    ],
  });
}
