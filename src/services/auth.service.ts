import { userRepository } from "@/repositories";
import { RegisterInput } from "@/types/auth";
import { AppError } from "@/utils/appError";
import bcrypt from "bcrypt";

export class AuthService {

    register = async (user: RegisterInput) => {
        const existing = await userRepository.findByEmail(user.email);
        if (existing) {
            throw new AppError("A user with this email already exists.", 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        const savedUser = await userRepository.save({
            ...user,
            password_hash: hashedPassword
        });

        return savedUser;
    }
}