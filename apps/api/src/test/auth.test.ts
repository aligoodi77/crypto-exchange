import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../app.js";

const validUser = {
  name: "Ali Goudarzi",
  email: "Ali.Test@Example.com",
  password: "Test@1234",
};

async function registerTestUser() {
  const response = await request(app)
    .post("/api/auth/register")
    .send(validUser);

  expect(response.status).toBe(201);

  return response.body.data as {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
    };
  };
}

describe("Auth endpoints", () => {
  it("registers a user and normalizes email to lowercase", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          name: "Ali Goudarzi",
          email: "ali.test@example.com",
          emailVerified: false,
        },
        emailVerificationRequired: true,
      },
    });

    expect(response.body.data.token).toEqual(expect.any(String));
  });

  it("rejects duplicate email with 409", async () => {
    await request(app).post("/api/auth/register").send(validUser);

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        ...validUser,
        email: "ALI.TEST@EXAMPLE.COM",
      });

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      success: false,
      message: "Email is already registered",
    });
  });

  it("rejects invalid registration body with 400", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "123",
    });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors).toEqual(expect.any(Array));
  });

  it("logs in with correct credentials", async () => {
    await registerTestUser();

    const response = await request(app).post("/api/auth/login").send({
      email: "ALI.TEST@EXAMPLE.COM",
      password: "Test@1234",
    });

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Logged in successfully",
      data: {
        user: {
          email: "ali.test@example.com",
        },
      },
    });

    expect(response.body.data.token).toEqual(expect.any(String));
  });

  it("rejects a wrong password with 401", async () => {
    await registerTestUser();

    const response = await request(app).post("/api/auth/login").send({
      email: validUser.email,
      password: "wrong-password",
    });

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid email or password",
    });
  });

  it("rejects /me without a token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Authorization token is missing",
    });
  });

  it("returns the current user with a valid token", async () => {
    const { token } = await registerTestUser();

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        name: "Ali Goudarzi",
        email: "ali.test@example.com",
        wallet: {
          balanceUsd: expect.any(String),
        },
      },
    });
  });

  it("revokes the token after logout", async () => {
    const { token } = await registerTestUser();

    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(logoutResponse.status).toBe(200);

    const meResponse = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meResponse.status).toBe(401);

    expect(meResponse.body).toEqual({
      success: false,
      message: "Token has been revoked. Please log in again.",
    });
  });

  it("invalidates the old token after password change", async () => {
    const { token } = await registerTestUser();

    const changePasswordResponse = await request(app)
      .patch("/api/auth/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "Test@1234",
        newPassword: "New-password@123",
      });

    expect(changePasswordResponse.status).toBe(200);

    const oldTokenResponse = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(oldTokenResponse.status).toBe(401);

    expect(oldTokenResponse.body).toEqual({
      success: false,
      message: "Session expired. Please log in again.",
    });

    const loginWithNewPassword = await request(app)
      .post("/api/auth/login")
      .send({
        email: validUser.email,
      password: "New-password@123",
      });

    expect(loginWithNewPassword.status).toBe(200);
    expect(loginWithNewPassword.body.data.token).toEqual(expect.any(String));
  });
});
