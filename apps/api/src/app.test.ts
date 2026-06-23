import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { app } from "./app.js";

describe("system routes", () => {
  it("returns the health check response", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({
      success: true,
      message: "API is running",
    });
  });
});

describe("CORS", () => {
  it("allows trade idempotency and sync secret request headers", async () => {
    const response = await request(app)
      .options("/api/trades/buy")
      .set("Origin", "http://localhost:3000")
      .set(
        "Access-Control-Request-Headers",
        "Content-Type, Authorization, Idempotency-Key, x-sync-secret",
      )
      .expect(204);

    expect(response.headers["access-control-allow-headers"]).toBe(
      "Content-Type,Authorization,Idempotency-Key,x-sync-secret",
    );
  });
});

describe("auth routes", () => {
  it("returns validation errors before registering a user", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          name: "A",
          email: "not-an-email",
          password: "123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "name" }),
          expect.objectContaining({ path: "email" }),
          expect.objectContaining({ path: "password" }),
        ]),
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
