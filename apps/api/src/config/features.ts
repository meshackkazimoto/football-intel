function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export const isScrapingEnabled = parseBoolean(process.env.ENABLE_SCRAPING);
