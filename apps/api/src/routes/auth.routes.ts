import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  loginController,
  registerController,
  meController,
  updateProfileController,
  changePasswordController,
  logoutController,
} from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middlewares/rate-limit.middleware.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, registerController);
authRouter.post("/login", authRateLimiter, loginController);
authRouter.get("/me", authMiddleware, meController);
authRouter.patch("/me/", authMiddleware, updateProfileController);
authRouter.patch("/me/password", authMiddleware, changePasswordController);
authRouter.post("/logout", authMiddleware, logoutController);
