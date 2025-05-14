import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function seedPaymentMethods() {
  await prisma.paymentMethod.create({
    data: {
      id: "773b46a5-8150-407a-a512-2d0513da0284",
      userId: "bb496cb6-15d3-4739-93bf-4a790f0668f2",
      provider: "stripe",
      providerId: "pm_bb496c_0",
      type: "credit_card",
      brand: "Visa",
      lastFour: "4242",
      isDefault: true,
      createdAt: new Date()
    }
  });
  await prisma.paymentMethod.create({
    data: {
      id: "94d8fa3b-a2fa-450d-a215-44e155b0cc95",
      userId: "8dea1067-4b61-4863-984a-8e665664eb14",
      provider: "stripe",
      providerId: "pm_8dea10_1",
      type: "paypal",
      brand: "PayPal",
      lastFour: "0000",
      isDefault: false,
      createdAt: new Date()
    }
  });
  await prisma.paymentMethod.create({
    data: {
      id: "65abca83-a027-4161-ac82-310a1cd9f243",
      userId: "23c678d2-2137-4758-bfc3-4a26afcd38c3",
      provider: "stripe",
      providerId: "pm_23c678_2",
      type: "credit_card",
      brand: "Mastercard",
      lastFour: "1234",
      isDefault: false,
      createdAt: new Date()
    }
  });
  await prisma.paymentMethod.create({
    data: {
      id: "07355e9d-1181-4b76-8b8e-77f4d36e2531",
      userId: "4bd0a013-2fa9-48ba-9d18-de3fdc17341f",
      provider: "stripe",
      providerId: "pm_4bd0a0_3",
      type: "paypal",
      brand: "Visa",
      lastFour: "8888",
      isDefault: false,
      createdAt: new Date()
    }
  });
  await prisma.paymentMethod.create({
    data: {
      id: "6855a4a3-60e7-4974-b1d8-e570760dabf7",
      userId: "6239f3c2-7cc3-4886-af60-abc41e5d4e2e",
      provider: "stripe",
      providerId: "pm_6239f3_4",
      type: "credit_card",
      brand: "PayPal",
      lastFour: "0000",
      isDefault: false,
      createdAt: new Date()
    }
  });
  await prisma.paymentMethod.create({
    data: {
      id: "af1a1235-2a26-48b4-9dbd-144c30c23422",
      userId: "3ca4cdcc-57a3-439e-9897-bb2fcda482b3",
      provider: "stripe",
      providerId: "pm_3ca4cd_5",
      type: "paypal",
      brand: "Amex",
      lastFour: "3782",
      isDefault: false,
      createdAt: new Date()
    }
  });
}
