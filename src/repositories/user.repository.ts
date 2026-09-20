import { User } from "@/types/user";
import { Knex } from "knex";

export const createUserRepository = async (db: Knex) => {
  return {
    save: async (user: User): Promise<User> => {
      const [savedUser] = await db("users").insert(user).returning("*");
      return savedUser;
    },

    findById: async (userId: string): Promise<User> => {
      const [user] = await db("users").where({ id: userId });
      return user;
    },

    findByEmail: async (email: string): Promise<User> => {
      const [user] = await db("users").where({ email: email });
      return user;
    }
  }

}
