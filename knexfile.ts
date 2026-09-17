import type { Knex } from "knex";
import { env } from "./src/config/env";

// Update with your config settings.

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: env.DATABASE_URL
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};

export default knexConfig;
