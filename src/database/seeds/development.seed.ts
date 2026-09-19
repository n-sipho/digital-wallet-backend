import { env } from "@/config/env";
import db from "../../config/database";
import { createUser } from "./factories/user.factory";
import { logger } from "@/utils/logger";

const userCount = env.SEED_USERS;

export async function seedDevelopment() {
  const existingUsers = await db("users").count("* as count").first();

  if (Number(existingUsers?.count ?? 0) > 0) {
    logger.info("Users already exist. Skipping seed.");
    return;
  }
  
  await db.transaction(async (trx) => {
    for (let i = 0; i < userCount; i++) {
      const user = await createUser(trx);
      logger.info("seeded user:", user);
    }
  });
}
