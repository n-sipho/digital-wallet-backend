import { z } from 'zod';

/**
 * Validator schema for shortening a URL via GET query parameter.
 * Example query: ?url=https://example.com/very/long/path
 */
export const authRegisterSchema = z.object({
    first_name: z.string().
        refine((lastName) => {
            return lastName.length >= 3;
        }, { error: "A First Name should be at least 3 letters" }),

    last_name: z.string().
        refine((lastName) => {
            return lastName.length >= 3;
        }, { error: "A Last Name should be at least 3 letters" }),

    email: z.email({ error: "Invalid email address format" }),

    password: z.string().refine((password) => {
        // ##To do
        // Validate password against made up rules like,
        //  the minimum characters required for a proper password.
        return password.length >= 8;
    }, { error: 'Password must be 8 characters or more' }),

    phone_number: z.string().refine((phoneNumber) => {
        // ##To do
        // Add validation for a phone number
        // A valid phone number has to be 10 numbers without contry code.
        return phoneNumber.length === 10;
    }, { error: "Invalid Phone Number" }),
});

export const authLoginSchema = z.object({
    email: z.email({ error: "Invalid email address format" }),
    password: z.string().refine((password) => {
        // ##To do
        // Validate password against made up rules like,
        //  the minimum characters required for a proper password.
        return password.length >= 8;
    }, { error: 'Password must be 8 characters or more' }),
});