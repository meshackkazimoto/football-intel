import { randomUUID } from "crypto";

export function requestId() {
  return randomUUID();
}