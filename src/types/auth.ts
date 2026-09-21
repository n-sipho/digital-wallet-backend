import { User } from "./user";

export interface RegisterInput extends User {
    password: string;
 }

export interface LoginInput {
    email: string;
    password: string;
}