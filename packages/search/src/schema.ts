export const playerCollection = {
  name: "players",
  fields: [
    { name: "id", type: "string" },
    { name: "fullName", type: "string" },
    { name: "clubName", type: "string", optional: true },
    { name: "clubId", type: "string", facet: true, optional: true },
    { name: "leagueId", type: "string", facet: true, optional: true },
    { name: "seasonId", type: "string", facet: true, optional: true },
    { name: "nationalityId", type: "string", facet: true, optional: true },
  ],
} as const;
