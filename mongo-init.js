db.createCollection("event_types");
db.createCollection("musical_styles");
db.createCollection("notifications");

db.event_types.createIndex(
  { id: 1 },
  {
    unique: true,
  },
);

db.musical_styles.createIndex(
  { id: 1 },
  {
    unique: true,
  },
);

db.notifications.createIndex(
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

db.musical_styles.insertMany([
  {
    id: "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
    label: { en: "Rock", es: "Rock", ca: "Rock" },
    icon: "🎸",
  },
  {
    id: "b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e",
    label: { en: "Pop", es: "Pop", ca: "Pop" },
    icon: "🎤",
  },
  {
    id: "c3d4e5f6-a7b8-6c7d-0e9f-1a2b3c4d5e6f",
    label: { en: "Jazz", es: "Jazz", ca: "Jazz" },
    icon: "🎷",
  },
  {
    id: "d4e5f6a7-b8c9-7d8e-1f0a-2b3c4d5e6f7a",
    label: { en: "Blues", es: "Blues", ca: "Blues" },
    icon: "🎶",
  },
  {
    id: "e5f6a7b8-c9d0-8e9f-2a1b-3c4d5e6f7a8b",
    label: { en: "Folk", es: "Folk", ca: "Folk" },
    icon: "🪕",
  },
  {
    id: "f6a7b8c9-d0e1-9f0a-3b2c-4d5e6f7a8b9c",
    label: { en: "Classical", es: "Clásica", ca: "Clàssica" },
    icon: "🎻",
  },
  {
    id: "a7b8c9d0-e1f2-0a1b-4c3d-5e6f7a8b9c0d",
    label: { en: "Electronic", es: "Electrónica", ca: "Electrònica" },
    icon: "🎛️",
  },
  {
    id: "b8c9d0e1-f2a3-1b2c-5d4e-6f7a8b9c0d1e",
    label: { en: "Hip Hop", es: "Hip Hop", ca: "Hip Hop" },
    icon: "🎧",
  },
  {
    id: "c9d0e1f2-a3b4-2c3d-6e5f-7a8b9c0d1e2f",
    label: { en: "R&B", es: "R&B", ca: "R&B" },
    icon: "🎹",
  },
  {
    id: "d0e1f2a3-b4c5-3d4e-7f6a-8b9c0d1e2f3a",
    label: { en: "Country", es: "Country", ca: "Country" },
    icon: "🤠",
  },
  {
    id: "2fcd0868-8a53-42e6-ae0e-7db6a5f2f0d6",
    label: { en: "Other", es: "Otros", ca: "Altres" },
    icon: "➕",
  },
]);
