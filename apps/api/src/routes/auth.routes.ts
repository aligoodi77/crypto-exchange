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

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/me", authMiddleware, meController);
authRouter.patch("/me/", authMiddleware, updateProfileController);
authRouter.patch("/me/password", authMiddleware, changePasswordController);
authRouter.post("/logout", authMiddleware, logoutController);
