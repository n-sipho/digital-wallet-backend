import request from "supertest";
import { app } from "../../src/app";

describe("Health API", () => {
  it("GET /health returns 200 OK", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
