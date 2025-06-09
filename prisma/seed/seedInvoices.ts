import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { contractEntries } from "./seedContracts";

const prisma = new PrismaClient();

export async function seedInvoices() {
  for (const contract of contractEntries) {
    if (contract.status !== "canceled") {
      await prisma.invoice.create({
        data: {
          id: uuid(),
          contractId: contract.id,
          amount: Math.floor(Math.random() * 500) + 100,
          status: ["PAID", "PENDING", "FAILED"][Math.floor(Math.random() * 3)],
          fileUrl: "http://localhost:4000/files/invoice-uuid-date.pdf",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log("✅ Invoices seeded successfully.");
}
