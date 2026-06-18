import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  loginController,
  registerController,
  meController,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/me", authMiddleware, meController);
