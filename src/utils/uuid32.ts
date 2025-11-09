import { randomUUID } from "crypto";

export function uuid32() {
  return randomUUID().replace(/-/g, "").toLowerCase();
}
