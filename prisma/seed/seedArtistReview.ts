import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

export async function seedArtistReviews() {
  await prisma.artistReview.createMany({
    data: [
      {
        id: uuid(),
        bandId: "b4ed7600-12da-4673-960d-ff29af2606db",
        userId: "bb496cb6-15d3-4739-93bf-4a790f0668f2",
        bookingId: "ba25f50d-6b50-4843-8ae7-e1c989779444",
        rating: 5,
        comment: "Incredible performance, the synths were out of this world!",
        date: new Date("2025-04-01T20:00:00.000Z"),
      },
      {
        id: uuid(),
        bandId: "824863a8-1e09-4d69-9e5d-8e0bff068129",
        userId: "8dea1067-4b61-4863-984a-8e665664eb14",
        bookingId: "f267fc58-5472-4b9a-800a-c67cbc648083",
        rating: 4,
        comment: "Smooth jazz, great energy. Would book again.",
        date: new Date("2025-04-02T20:00:00.000Z"),
      },
      {
        id: uuid(),
        bandId: "eef58ab1-c216-4d23-81cd-432ab1637caa",
        userId: "23c678d2-2137-4758-bfc3-4a26afcd38c3",
        bookingId: "e3c6fa0d-9966-431c-8c6f-aeba5d3ec507",
        rating: 5,
        comment: "Authentic and full of life. Perfect for our event!",
        date: new Date("2025-04-03T20:00:00.000Z"),
      },
      {
        id: uuid(),
        bandId: "2f71420b-c2ed-4eed-a8c6-02a061b95958",
        userId: "4bd0a013-2fa9-48ba-9d18-de3fdc17341f",
        bookingId: "005a9a95-8b56-4560-99d9-f5643fde687c",
        rating: 4,
        comment: "They brought the groove! Great stage presence.",
        date: new Date("2025-04-04T20:00:00.000Z"),
      },
      {
        id: uuid(),
        bandId: "724382b4-6878-4f84-b177-9668b88cc6d9",
        userId: "6239f3c2-7cc3-4886-af60-abc41e5d4e2e",
        bookingId: "a1083d79-4e08-4768-987b-e33060f6ac82",
        rating: 5,
        comment: "One of the best live rock performances I've seen.",
        date: new Date("2025-04-05T20:00:00.000Z"),
      },
      {
        id: uuid(),
        bandId: "f5e06fc0-9a0e-4f53-a447-0374e9cb12c5",
        userId: "3ca4cdcc-57a3-439e-9897-bb2fcda482b3",
        bookingId: "f7e36886-2ba4-4d2a-a071-d1bc0c7254c3",
        rating: 3,
        comment: "Great vocals but a bit shy on stage. Still enjoyable.",
        date: new Date("2025-04-06T20:00:00.000Z"),
      },
      {
        id: uuid(),
        bandId: "aac0e317-f109-4cd0-9b6d-342b41cf1b9e",
        userId: "bb496cb6-15d3-4739-93bf-4a790f0668f2",
        bookingId: "cb58f0ca-afd4-459f-b0e4-0a4e2d9a3511",
        rating: 4,
        comment: "Very soulful sound. A modern twist on a classic style.",
        date: new Date("2025-04-07T20:00:00.000Z"),
      },
    ],
  });
}
