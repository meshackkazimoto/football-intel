import Typesense from "typesense";

export const typesense = new Typesense.Client({
  nodes: [
    {
      host: "localhost",
      port: 8108,
      protocol: "http"
    }
  ],
  apiKey: process.env.TYPESENSE_API_KEY ?? "football-intel-dev-key",
  connectionTimeoutSeconds: 2
});