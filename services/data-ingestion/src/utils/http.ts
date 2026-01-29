import axios from "axios";
import { logger } from "@football-intel/logger";
import type { IngestionPayload } from "../types";

const INGESTION_API_URL =
  process.env.INGESTION_API_URL || "http://localhost:3000/admin/ingest";

export async function sendToIngestion(body: IngestionPayload) {
  try {
    const response = await axios.post(INGESTION_API_URL, body, {
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Test-Mode": "true",
      },
    });

    if (response.status !== 200 && response.status !== 201) {
      logger.error(
        { status: response.status, data: response.data },
        `Failed to send data to ingestion`,
      );
    }
  } catch (error) {
    logger.error({ error }, "Error sending data to ingestion service");
  }
}
