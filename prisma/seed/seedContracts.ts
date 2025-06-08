import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

export const contractEntries = [
  {
    id: uuid(),
    bookingId: "005a9a95-8b56-4560-99d9-f5643fde687c",
    fileUrl: "http://localhost:4000/files/contract-uuid-date.pdf",
    status: "SIGNED",
  },
  {
    id: uuid(),
    bookingId: "ba25f50d-6b50-4843-8ae7-e1c989779444",
    fileUrl: "http://localhost:4000/files/contract-uuid-date.pdf",
    status: "PENDING",
  },
  {
    id: uuid(),
    bookingId: "f267fc58-5472-4b9a-800a-c67cbc648083",
    fileUrl: "http://localhost:4000/files/contract-uuid-date.pdf",
    status: "CANCELLED",
  },
  {
    id: uuid(),
    bookingId: "e3c6fa0d-9966-431c-8c6f-aeba5d3ec507",
    fileUrl: "http://localhost:4000/files/contract-uuid-date.pdf",
    status: "SIGNED",
  },
  {
    id: uuid(),
    bookingId: "a1083d79-4e08-4768-987b-e33060f6ac82",
    fileUrl: "http://localhost:4000/files/contract-uuid-date.pdf",
    status: "PENDING",
  },
  {
    id: uuid(),
    bookingId: "f7e36886-2ba4-4d2a-a071-d1bc0c7254c3",
    fileUrl: "http://localhost:4000/files/contract-uuid-date.pdf",
    status: "SIGNED",
  },
];

export async function seedContracts() {
  for (const contract of contractEntries) {
    await prisma.contract.create({
      data: {
        id: contract.id,
        bookingId: contract.bookingId,
        status: contract.status,
        fileUrl: contract.fileUrl,
        date: new Date(),
      },
    });
  }

  console.log("✅ Contracts seeded successfully.");
}
