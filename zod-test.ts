import * as z from "zod";

const schema = z.string().refine(async (val) => val.length <= 8);

const results = await schema.parseAsync("hello34e");
// => "hello"
// console.log(results);


const passwordSchema = z.string().refine((val) => {
    // To do
    // Validate password against made up rules like,
    //  the minimum characters required for a proper password
    return val.length >= 8;
}, { error: 'Password must be 8 characters or more' });

const password = passwordSchema.parse("123456755343")

// console.log(password);


const emailScema = z.email({ error: "Invalid email address" });

const email = emailScema.parse("sbu#gmail.com")

console.log(email);