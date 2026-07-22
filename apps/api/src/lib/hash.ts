import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const ROUNDS = 12;

export const hashPassword = (plain: string) => bcrypt.hash(plain, ROUNDS);
export const verifyPassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);

// Refresh tokens are stored as SHA-256 of the raw JWT so a DB dump can't be
// replayed. We only need a fast keyed comparison, not a slow KDF.
export const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

export const randomId = (bytes = 16) =>
  crypto.randomBytes(bytes).toString("hex");
