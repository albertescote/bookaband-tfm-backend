import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seedUsers";
import { seedBands } from "./seedBands";
import { seedBillingAddresses } from "./seedBillingAddresses";
import { seedPaymentMethods } from "./seedPaymentMethods";
import { seedEmailVerifications } from "./seedEmailVerifications";
import { seedBookings } from "./seedBookings";
import { seedChats } from "./seedChats";
import { seedContracts } from "./seedContracts";
import { seedInvoices } from "./seedInvoices";
import { seedMedia } from "./seedMedia";
import { seedSocialLinks } from "./seedSocialLink";
import { seedArtistReviews } from "./seedArtistReview";

const prisma = new PrismaClient();

async function clearDatabase() {
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
}

async function main() {
  console.log("🧹 Clearing database...");
  await clearDatabase();

  console.log("🌱 Seeding data...");
  await seedUsers();
  await seedEmailVerifications();
  await seedBands();
  await seedBillingAddresses();
  await seedPaymentMethods();
  await seedBookings();
  await seedChats();
  await seedContracts();
  await seedInvoices();
  await seedMedia();
  await seedSocialLinks();
  await seedArtistReviews();

  console.log("✅ Modular seed executed successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
