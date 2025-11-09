import crypto from "crypto";

export function uuid32() {
  return crypto.randomUUID().replace(/-/g, "");
}