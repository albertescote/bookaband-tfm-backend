import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

export async function seedSocialLinks() {
  await prisma.socialLink.createMany({
    data: [
      {
        id: uuid(),
        bandId: "b4ed7600-12da-4673-960d-ff29af2606db",
        platform: "Instagram",
        url: "https://instagram.com/electricwaves",
      },
      {
        id: uuid(),
        bandId: "b4ed7600-12da-4673-960d-ff29af2606db",
        platform: "Spotify",
        url: "https://open.spotify.com/artist/7CajNmpbOovFoOoasH2HaY",
      },
      {
        id: uuid(),
        bandId: "824863a8-1e09-4d69-9e5d-8e0bff068129",
        platform: "YouTube",
        url: "https://youtube.com/saxandsoul",
      },
      {
        id: uuid(),
        bandId: "eef58ab1-c216-4d23-81cd-432ab1637caa",
        platform: "Facebook",
        url: "https://facebook.com/mariachisdelsol",
      },
      {
        id: uuid(),
        bandId: "0795cc24-7738-4ab4-8e1c-510d30c32c86",
        platform: "Instagram",
        url: "https://instagram.com/clasicosdecamara",
      },
      {
        id: uuid(),
        bandId: "2f71420b-c2ed-4eed-a8c6-02a061b95958",
        platform: "Spotify",
        url: "https://open.spotify.com/artist/4q3ewBCX7sLwd24euuV69X",
      },
      {
        id: uuid(),
        bandId: "724382b4-6878-4f84-b177-9668b88cc6d9",
        platform: "Instagram",
        url: "https://instagram.com/midnightrockers",
      },
      {
        id: uuid(),
        bandId: "f5e06fc0-9a0e-4f53-a447-0374e9cb12c5",
        platform: "YouTube",
        url: "https://youtube.com/indielights",
      },
      {
        id: uuid(),
        bandId: "e4d27d4f-7701-4e60-bc4f-77773c2c16fc",
        platform: "Facebook",
        url: "https://facebook.com/groovecollective",
      },
      {
        id: uuid(),
        bandId: "aac0e317-f109-4cd0-9b6d-342b41cf1b9e",
        platform: "Instagram",
        url: "https://instagram.com/theneoclassics",
      },
    ],
  });
}
