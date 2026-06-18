import type { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
