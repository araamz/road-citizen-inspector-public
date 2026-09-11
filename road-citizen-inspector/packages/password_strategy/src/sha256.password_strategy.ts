import type { PasswordStrategy } from "./password_strategy.interface.ts";
import * as crypto from "node:crypto";

export class SHA256PasswordStrategy implements PasswordStrategy {
  hash(password: string) {
    const salt = crypto.randomBytes(32).toString("hex");
    const generatedHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha256")
      .toString("hex");

    return {
      salt: salt,
      hash: generatedHash,
    };
  }

  compare(password: string, hash: string, salt: string) {
    const generatedHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha256")
      .toString("hex");
    return hash === generatedHash;
  }
}
