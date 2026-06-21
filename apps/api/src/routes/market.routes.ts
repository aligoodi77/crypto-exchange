import { Router } from "express";

import { getMarketsController } from "../controllers/market.controller.js";

export const marketRouter = Router();

marketRouter.get("/", getMarketsController);
