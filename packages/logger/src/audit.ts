import { logger } from "./logger";

export function auditLog(event: {
  action: string;
  entity: string;
  entityId?: string;
  userId: string;
  metadata?: Record<string, any>;
}) {
  logger.info({
    type: "AUDIT",
    ...event,
    timestamp: new Date().toISOString(),
  });
}