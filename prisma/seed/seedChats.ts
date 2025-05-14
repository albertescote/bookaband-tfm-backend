import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedChats() {
  await prisma.chat.create({
    data: {
      id: "241bd47d-2854-4fca-8d7b-61412dc2e59b",
      userId: "bb496cb6-15d3-4739-93bf-4a790f0668f2",
      bandId: "b4ed7600-12da-4673-960d-ff29af2606db",
      messages: {
        createMany: {
          data: [
            {
              id: "d1b31cbf-0c98-4cc7-a96e-808928f5a480",
              senderId: "bb496cb6-15d3-4739-93bf-4a790f0668f2",
              recipientId: "b4ed7600-12da-4673-960d-ff29af2606db",
              content: "Message from user to band 1",
              isRead: true,
            },
            {
              id: "2815b1fa-05b4-4192-b1d3-6149c71bdb55",
              senderId: "b4ed7600-12da-4673-960d-ff29af2606db",
              recipientId: "bb496cb6-15d3-4739-93bf-4a790f0668f2",
              content: "Reply from band 1",
              isRead: true,
            },
          ],
        },
      },
    },
  });
  await prisma.chat.create({
    data: {
      id: "af3f32f3-fe6e-42ed-8b3b-f52844a7e500",
      userId: "8dea1067-4b61-4863-984a-8e665664eb14",
      bandId: "824863a8-1e09-4d69-9e5d-8e0bff068129",
      messages: {
        createMany: {
          data: [
            {
              id: "148690bd-7cfb-4a73-a11d-d0cd8c37ed21",
              senderId: "8dea1067-4b61-4863-984a-8e665664eb14",
              recipientId: "824863a8-1e09-4d69-9e5d-8e0bff068129",
              content: "Message from user to band 2",
              isRead: true,
            },
            {
              id: "522ab1e2-2f2b-47ef-a90f-2758d811fe8e",
              senderId: "824863a8-1e09-4d69-9e5d-8e0bff068129",
              recipientId: "8dea1067-4b61-4863-984a-8e665664eb14",
              content: "Reply from band 2",
              isRead: true,
            },
          ],
        },
      },
    },
  });
  await prisma.chat.create({
    data: {
      id: "bff1b17c-2399-4f7c-aa0f-8cb34a308fd6",
      userId: "23c678d2-2137-4758-bfc3-4a26afcd38c3",
      bandId: "eef58ab1-c216-4d23-81cd-432ab1637caa",
      messages: {
        createMany: {
          data: [
            {
              id: "ef5bd93d-b19c-4d8c-a456-b0cce83cd631",
              senderId: "23c678d2-2137-4758-bfc3-4a26afcd38c3",
              recipientId: "eef58ab1-c216-4d23-81cd-432ab1637caa",
              content: "Message from user to band 3",
              isRead: true,
            },
            {
              id: "3c82109a-4944-46ec-89af-99cf4d5a9e6c",
              senderId: "eef58ab1-c216-4d23-81cd-432ab1637caa",
              recipientId: "23c678d2-2137-4758-bfc3-4a26afcd38c3",
              content: "Reply from band 3",
              isRead: true,
            },
          ],
        },
      },
    },
  });
}
