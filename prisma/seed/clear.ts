import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing database...");
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.billingAddress.deleteMany();
  await prisma.band.deleteMany();
  await prisma.hospitalityRider.deleteMany();
  await prisma.technicalRider.deleteMany();
  await prisma.performanceArea.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.media.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.artistReview.deleteMany();

  console.log("✅ Database cleared successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
