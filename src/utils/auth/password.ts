import bcrypt from "bcrypt";

const SALT: number = 10;

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(SALT);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    const hashedPassword = await bcrypt.compare(password, hash);
    return hashedPassword;
}