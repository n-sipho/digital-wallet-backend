import { faker } from "@faker-js/faker";
import type { Knex } from "knex";

export async function createUser(db: Knex) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const [user] = await db("users")
    .insert({
      first_name: firstName,
      last_name: lastName,
      email: faker.internet.email({ firstName, lastName, provider: "xyz.com" }),
      phone_number: faker.phone.number({ style: "mobile" }),
      password_hash: "development-password-hash",
    })
    .returning("*");

  return user;
}

