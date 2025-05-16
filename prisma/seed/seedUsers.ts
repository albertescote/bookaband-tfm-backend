import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedUsers() {
  await prisma.user.createMany({
    data: [
      {
        id: "f2f272b4-e902-4677-a709-ab333e3d280c",
        firstName: "Alex",
        familyName: "Romero",
        email: "alex.romero@example.com",
        imageUrl:
          "https://images.pexels.com/photos/12250627/pexels-photo-12250627.jpeg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Musician",
      },
      {
        id: "bb496cb6-15d3-4739-93bf-4a790f0668f2",
        firstName: "Sofia",
        familyName: "Martínez",
        email: "sofia.martinez@example.com",
        imageUrl:
          "https://images.pexels.com/photos/8041144/pexels-photo-8041144.jpeg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Client",
      },
      {
        id: "892b48de-a91a-4c30-9c89-3162f7aa815c",
        firstName: "Liam",
        familyName: "Brown",
        email: "liam.brown@example.com",
        imageUrl:
          "https://images.pexels.com/photos/3018075/pexels-photo-3018075.jpeg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Musician",
      },
      {
        id: "8dea1067-4b61-4863-984a-8e665664eb14",
        firstName: "Emma",
        familyName: "White",
        email: "emma.white@example.com",
        imageUrl:
          "https://images.pexels.com/photos/3769099/pexels-photo-3769099.jpeg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Client",
      },
      {
        id: "f268b4b2-9146-4f60-8cce-96e6daae0d5d",
        firstName: "Carlos",
        familyName: "Díaz",
        email: "carlos.diaz@example.com",
        imageUrl:
          "https://images.pexels.com/photos/1365167/pexels-photo-1365167.jpeg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Musician",
      },
      {
        id: "23c678d2-2137-4758-bfc3-4a26afcd38c3",
        firstName: "Lucía",
        familyName: "Gómez",
        email: "lucia.gomez@example.com",
        imageUrl:
          "https://img.freepik.com/free-photo/young-beautiful-blonde-woman-wearing-casual-striped-tshirt-isolated-white-background-looking-away-side-with-smile-face-natural-expression-laughing-confident_839833-30463.jpg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Client",
      },
      {
        id: "995cf05d-f641-4874-8bed-31742212cddd",
        firstName: "Noah",
        familyName: "Lopez",
        email: "noah.lopez@example.com",
        imageUrl:
          "https://img.freepik.com/foto-gratis/joven-barbudo-camisa_273609-5938.jpg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Musician",
      },
      {
        id: "4bd0a013-2fa9-48ba-9d18-de3fdc17341f",
        firstName: "Isabella",
        familyName: "Vega",
        email: "isabella.vega@example.com",
        imageUrl:
          "https://images.pexels.com/photos/11319542/pexels-photo-11319542.jpeg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Client",
      },
      {
        id: "97295898-f96d-4e30-b706-38c351165d0c",
        firstName: "Ethan",
        familyName: "Silva",
        email: "ethan.silva@example.com",
        imageUrl:
          "https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed-holding-white-headphone-around-his-neck_23-2148096439.jpg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Musician",
      },
      {
        id: "6239f3c2-7cc3-4886-af60-abc41e5d4e2e",
        firstName: "Mia",
        familyName: "Torres",
        email: "mia.torres@example.com",
        imageUrl:
          "https://images.pexels.com/photos/19110742/pexels-photo-19110742/free-photo-of-dona-model-ros-dempeus.jpeg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Client",
      },
      {
        id: "1eb2a6cf-0102-4b93-84e5-69d9a26ab519",
        firstName: "Daniel",
        familyName: "Moreno",
        email: "daniel.moreno@example.com",
        imageUrl:
          "https://images.pexels.com/photos/27045934/pexels-photo-27045934/free-photo-of-home-llibres-llibreria-model.jpeg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Musician",
      },
      {
        id: "3ca4cdcc-57a3-439e-9897-bb2fcda482b3",
        firstName: "Valentina",
        familyName: "Navarro",
        email: "valentina.navarro@example.com",
        imageUrl:
          "https://images.pexels.com/photos/29681444/pexels-photo-29681444/free-photo-of-retrat-de-moda-urbana-als-carrers-de-berlin.jpeg",
        password:
          "$2b$10$rGiVe3S8m0O9KUJ9i1hip.04IoWAE3Ws5B2FUxFXaYdfxdKnqUjT2",
        role: "Client",
      },
    ],
  });
}
