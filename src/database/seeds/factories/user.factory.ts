import { User } from "@/types/user";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

export const createUser = (): User => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const user = {
    id: uuidv4(),
    first_name: firstName,
    last_name: lastName,
    email: faker.internet.email({ firstName, lastName, provider: "xyz.com" }),
    phone_number: faker.phone.number({ style: "mobile" }),
    password_hash: "development-password-hash",
  }


  return user;
}


// console.log(createUser());
