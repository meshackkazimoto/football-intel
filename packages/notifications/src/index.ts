import { logger } from "@football-intel/logger";

export type NotificationType =
  | "goal"
  | "match_start"
  | "standings_change"
  | "milestone";

export async function sendNotification(
  userId: string,
  type: NotificationType,
  payload: any,
) {
  logger.info({
    event: "notification_sent",
    userId,
    type,
    payload,
  });

  // In a real app, this would send a push notification via FCM/SNS or an email
  console.log(
    `[NOTIFICATION] To User ${userId}: ${type} - ${JSON.stringify(payload)}`,
  );
}

export async function broadcastNotification(
  type: NotificationType,
  payload: any,
) {
  logger.info({
    event: "notification_broadcast",
    type,
    payload,
  });

  console.log(`[BROADCAST] ${type}: ${JSON.stringify(payload)}`);
}
