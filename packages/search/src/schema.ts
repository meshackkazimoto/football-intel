export const playerCollection = {
  name: "players",
  fields: [
    { name: "id", type: "string" },
    { name: "fullName", type: "string" },
    { name: "clubName", type: "string", optional: true },
  ],
} as const;
