// import db from "@/config/database";

import { Knex } from "knex";

interface User {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password_hash: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export const createUserRepository = async (db: Knex) => {
  return {
    save: async (user: User) => {
      const exists = await db("users").where({ email: user.email }).first();
      if (!exists) {
        await db("users").insert(user);
      }
    },

    findById: async (userId: string): Promise<User> =>
      await db("users").where({ id: userId }).first(),

    findByEmail: async (email: string): Promise<User> =>
      await db("users").where({ email: email }).first(),
  }

}

// export const userRepository = new UserRepository();
