import { describe, expect, jest, it, beforeAll, afterAll } from "@jest/globals";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import knex, { Knex } from "knex";
import fs from "node:fs/promises";
import path from "node:path";
import { createUser as createTestUser } from "@/database/seeds/factories/user.factory";
import { userRepository } from ".";

describe("User Repository", () => {
  jest.setTimeout(60000);

  let postgresContainer: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let knexClient: Knex;

  beforeAll(async () => {
    const container = await new PostgreSqlContainer("postgres:13.3-alpine").start();
    postgresContainer = container;

    knexClient = knex({
      client: "postgresql",
      connection: container.getConnectionUri(),
    })

    const schemaPath = path.resolve(
      process.cwd(),
      "src/database/schema.sql"
    );

    const schema = await fs.readFile(schemaPath, "utf8");

    await knexClient.raw(schema);

  });

  afterAll(async () => {
    await knexClient.destroy();
    await postgresContainer.stop();
  });


  it("should create and return a new user", async () => {
    const testUser = createTestUser();


    const dbUser = await userRepository.save(testUser);
    expect(dbUser).toMatchObject({
      email: testUser.email,
      phone_number: testUser.phone_number,
      password_hash: testUser.password_hash,
      first_name: testUser.first_name,
      last_name: testUser.last_name,
    });
  });

  it("should find user by email", async () => {
    const testUser = createTestUser();

    await userRepository.save(testUser);
    const dbUser = await userRepository.findByEmail(testUser.email);

    expect(dbUser.email).toEqual(testUser.email);
  });

  it("should find user by id", async () => {
    const testUser = createTestUser();
    const userId = testUser.id as string;

    await userRepository.save(testUser);
    const dbUser = await userRepository.findById(userId);

    expect(dbUser.email).toEqual(testUser.email);
  });

});
