import { env } from '@/config/env';
import { UserAuthToken } from '@/types/user';
import jwt from 'jsonwebtoken';
import { AppError } from '../appError';

const { JWT_SECRET } = env;

export const createUserAuthToken = (user: UserAuthToken): string => {
    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '300Years' }
    );
    return token;
}


export const verifyAccessToken = (token: string) => {
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) {
            throw new AppError(`Unauthorized`, 401);
        }
        return payload;
    });
}