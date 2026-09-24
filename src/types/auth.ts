import { User } from "./user";

export interface RegisterInput extends User {
    password: string;
 }

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterResult {
    publicUser: Omit<User, "password_hash">;
    token: string;
}

export type LoginResult = string;
