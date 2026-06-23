import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../app.js";

describe("System endpoints", () => {
  it("GET /health -> 200", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "API is running",
    });
  });

  it("unknown route -> 404", async () => {
    const response = await request(app).get("/api/not-found");

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      success: false,
      message: "Route not found: GET /api/not-found",
    });
  });

  it("invalid JSON body -> 400", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send('{"name":"Ali"');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
