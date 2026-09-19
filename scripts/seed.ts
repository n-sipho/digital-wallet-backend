import { seedDevelopment } from "../src/database/seeds/development.seed";
import db from "../src/config/database";
import { logger } from "../src/utils/logger";

async function main() {
  try {
    await seedDevelopment();

    logger.info("Database seeded successfully.");
  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

main();
