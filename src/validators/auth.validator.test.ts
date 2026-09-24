import { describe, expect, jest, it, beforeAll, afterAll } from "@jest/globals";
import { authRegisterSchema } from "./auth.validator";

describe("Auth validators", () => {
  it("should validate the register input data and return a validated input", async () => {
    const testUser = {
      first_name: "Test",
      last_name: "Test",
      email: "Test@test.com",
      password: "12345678",
      phone_number: "1234567890"
    }

    const parsedInput = authRegisterSchema.parse(testUser);

    expect(parsedInput).toMatchObject(testUser);
  });

});
