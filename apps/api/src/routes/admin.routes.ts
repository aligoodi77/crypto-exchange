import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

import {
  getAdminCoinsController,
  getAdminStatsController,
  getAdminTransactionsController,
  getAdminUserController,
  getAdminUsersController,
  manualCoinSyncController,
  updateAdminCoinStatusController,
} from "../controllers/admin.controller.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware);

adminRouter.use(adminMiddleware);

adminRouter.get("/stats", getAdminStatsController);

adminRouter.get("/users", getAdminUsersController);

adminRouter.get("/users/:id", getAdminUserController);

adminRouter.get("/transactions", getAdminTransactionsController);

adminRouter.get("/coins", getAdminCoinsController);

adminRouter.patch(
  "/coins/:id/status",
  updateAdminCoinStatusController,
);

adminRouter.post("/coins/sync", manualCoinSyncController);
