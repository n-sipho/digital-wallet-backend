import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { createUserRepository } from "./user.repository";
import knex, { Knex } from "knex";
import fs from "node:fs/promises";
import path from "node:path";

describe("User Repository", () => {
  jest.setTimeout(60000);

  let postgresContainer: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
  let knexClient: Knex;

  beforeAll(async () => {
    const container = await new PostgreSqlContainer("postgres:13.3-alpine").start();

    postgresContainer = container;

    knexClient = knex({
      client: "postgresql",
      connection: {
        host: container.getHost(),
        port: postgresContainer.getPort(),
        user: postgresContainer.getUsername(),
        password: postgresContainer.getPassword(),
        database: postgresContainer.getDatabase(),
      }
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


  it("should create and return the new user", async () => {
    const userRepository = await createUserRepository(knexClient)
    const newUser = {
      id: "53dcdfbe-7b1c-4668-a398-2d72ffff19bd",
      email: 'Kira.Zemlak@xyz.com',
      phone_number: '9647169685',
      password_hash: 'development-password-hash',
      first_name: 'Kira',
      last_name: 'Zemlak',
      status: 'ACTIVE',
    }

    await userRepository.save(newUser);
    const dbUser = await userRepository.findById(newUser.id);
    expect(dbUser).toMatchObject({
      id: newUser.id,
      email: newUser.email,
      phone_number: newUser.phone_number,
      password_hash: newUser.password_hash,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      status: newUser.status,
    });
  });
});
