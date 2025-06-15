import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

export async function seedMedia() {
  await prisma.media.createMany({
    data: [
      {
        id: uuid(),
        bandId: "b4ed7600-12da-4673-960d-ff29af2606db",
        url: "https://images.pexels.com/photos/1309240/pexels-photo-1309240.jpeg",
        type: "image",
      },
      {
        id: uuid(),
        bandId: "b4ed7600-12da-4673-960d-ff29af2606db",
        url: "https://videos.pexels.com/video-files/852360/852360-hd_1280_720_30fps.mp4",
        type: "video",
      },
      {
        id: uuid(),
        bandId: "824863a8-1e09-4d69-9e5d-8e0bff068129",
        url: "https://images.pexels.com/photos/16723807/pexels-photo-16723807.jpeg",
        type: "image",
      },
      {
        id: uuid(),
        bandId: "eef58ab1-c216-4d23-81cd-432ab1637caa",
        url: "https://images.pexels.com/photos/8088442/pexels-photo-8088442.jpeg",
        type: "image",
      },
      {
        id: uuid(),
        bandId: "eef58ab1-c216-4d23-81cd-432ab1637caa",
        url: "https://videos.pexels.com/video-files/2022395/2022395-hd_1920_1080_30fps.mp4",
        type: "video",
      },
      {
        id: uuid(),
        bandId: "0795cc24-7738-4ab4-8e1c-510d30c32c86",
        url: "https://images.pexels.com/photos/1225365/pexels-photo-1225365.jpeg",
        type: "image",
      },
      {
        id: uuid(),
        bandId: "2f71420b-c2ed-4eed-a8c6-02a061b95958",
        url: "https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg",
        type: "image",
      },
      {
        id: uuid(),
        bandId: "724382b4-6878-4f84-b177-9668b88cc6d9",
        url: "https://images.pexels.com/photos/16744646/pexels-photo-16744646.jpeg",
        type: "image",
      },
      {
        id: uuid(),
        bandId: "f5e06fc0-9a0e-4f53-a447-0374e9cb12c5",
        url: "https://images.pexels.com/photos/3707994/pexels-photo-3707994.jpeg",
        type: "image",
      },
      {
        id: uuid(),
        bandId: "e4d27d4f-7701-4e60-bc4f-77773c2c16fc",
        url: "https://images.pexels.com/photos/4087993/pexels-photo-4087993.jpeg",
        type: "image",
      },
      {
        id: uuid(),
        bandId: "aac0e317-f109-4cd0-9b6d-342b41cf1b9e",
        url: "https://videos.pexels.com/video-files/2306150/2306150-hd_1920_1080_30fps.mp4",
        type: "video",
      },
    ],
  });
}
