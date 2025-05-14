import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedBillingAddresses() {
  await prisma.billingAddress.create({
    data: {
      id: "8d66bf20-d8c1-4c25-b2a8-33da91682f11",
      userId: "bb496cb6-15d3-4739-93bf-4a790f0668f2",
      country: "Spain",
      city: "Barcelona",
      postalCode: "08000",
      addressLine1: "Calle Falsa 1",
      addressLine2: "Piso 1"
    }
  });
  await prisma.billingAddress.create({
    data: {
      id: "012e7f6c-88b1-4e0b-ac5f-70b16279c8ad",
      userId: "8dea1067-4b61-4863-984a-8e665664eb14",
      country: "Spain",
      city: "Madrid",
      postalCode: "08100",
      addressLine1: "Calle Falsa 2",
      addressLine2: "Piso 2"
    }
  });
  await prisma.billingAddress.create({
    data: {
      id: "7410907b-b0a1-46b6-86e4-b6f6dfd962bb",
      userId: "23c678d2-2137-4758-bfc3-4a26afcd38c3",
      country: "Spain",
      city: "Valencia",
      postalCode: "08200",
      addressLine1: "Calle Falsa 3",
      addressLine2: "Piso 3"
    }
  });
  await prisma.billingAddress.create({
    data: {
      id: "3f42ea87-9b66-41d9-9a29-958ea8664391",
      userId: "4bd0a013-2fa9-48ba-9d18-de3fdc17341f",
      country: "Spain",
      city: "Sevilla",
      postalCode: "08300",
      addressLine1: "Calle Falsa 4",
      addressLine2: "Piso 4"
    }
  });
  await prisma.billingAddress.create({
    data: {
      id: "df2ee795-f006-4f09-b6a1-4774e3636341",
      userId: "6239f3c2-7cc3-4886-af60-abc41e5d4e2e",
      country: "Spain",
      city: "Granada",
      postalCode: "08400",
      addressLine1: "Calle Falsa 5",
      addressLine2: "Piso 5"
    }
  });
  await prisma.billingAddress.create({
    data: {
      id: "2dfdee45-aa89-4d67-97be-f50ac792423f",
      userId: "3ca4cdcc-57a3-439e-9897-bb2fcda482b3",
      country: "Spain",
      city: "Bilbao",
      postalCode: "08500",
      addressLine1: "Calle Falsa 6",
      addressLine2: "Piso 6"
    }
  });
}
