import { env } from '@/config/env';
import { UserAuthToken } from '@/types/user';
import jwt from 'jsonwebtoken';
// import { AppError } from '../appError';

const { JWT_SECRET } = env;

export const createAccessToken = (user: UserAuthToken): string => {
    const token = jwt.sign({
        id: user.id,
        email: user.email
    },
        JWT_SECRET, {
        expiresIn: '300Years'
    });

    return token;
}