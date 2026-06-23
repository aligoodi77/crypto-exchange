import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  const possibleError = error as {
    status?: number;
    type?: string;
  };

  if (
    possibleError.status === 413 ||
    possibleError.type === "entity.too.large"
  ) {
    res.status(413).json({
      success: false,
      message: "Request body is too large",
    });
    return;
  }

  if (error instanceof SyntaxError) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON body",
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
