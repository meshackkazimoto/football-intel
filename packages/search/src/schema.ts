export const playerCollection = {
  name: "players",
  fields: [
    { name: "id", type: "string" },
    { name: "fullName", type: "string" },
    { name: "position", type: "string", optional: true },
    { name: "teamId", type: "string", optional: true, facet: true },
    { name: "teamName", type: "string", optional: true },
    { name: "clubId", type: "string", optional: true, facet: true },
    { name: "clubName", type: "string", optional: true },
    { name: "leagueId", type: "string", optional: true, facet: true },
    { name: "leagueName", type: "string", optional: true },
    { name: "seasonId", type: "string", optional: true, facet: true },
  ],
} as const;

export const teamCollection = {
  name: "teams",
  fields: [
    { name: "id", type: "string" },
    { name: "name", type: "string" },
    { name: "clubId", type: "string", facet: true },
    { name: "clubName", type: "string" },
    { name: "seasonId", type: "string", facet: true },
    { name: "seasonName", type: "string" },
    { name: "leagueId", type: "string", facet: true },
    { name: "leagueName", type: "string" },
    { name: "countryId", type: "string", facet: true },
  ],
} as const;