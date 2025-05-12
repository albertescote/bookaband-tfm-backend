db.entity.drop();
db.createCollection("event_types");

db.event_types.createIndex(
  { id: 1 },
  {
    unique: true,
  },
);

db.event_types.insertMany([
  {
    id: "680e3e8f-8e08-4921-8461-0f60971c8b5f",
    label: {
      en: "Weddings",
      es: "Bodas",
      ca: "Casaments",
    },
    icon: "💍",
  },
  {
    id: "7c223ed2-e955-4007-ac8a-f23235127ac5",
    label: {
      en: "Private Parties",
      es: "Fiestas Privadas",
      ca: "Festes Privades",
    },
    icon: "🎉",
  },
  {
    id: "ec30f141-5914-46e3-a482-39d55a097e9b",
    label: {
      en: "Festivals",
      es: "Festivales",
      ca: "Festivals",
    },
    icon: "🎪",
  },
  {
    id: "d28c8f50-ef20-4e23-9992-1a6f1e540a09",
    label: {
      en: "Restaurants & Hotels",
      es: "Restaurantes y Hoteles",
      ca: "Restaurants i Hotels",
    },
    icon: "🍽️",
  },
  {
    id: "4d36abfe-0ce7-4ac5-a888-ce31d22cff8c",
    label: {
      en: "Businesses",
      es: "Empresas",
      ca: "Empreses",
    },
    icon: "🏢",
  },
]);
