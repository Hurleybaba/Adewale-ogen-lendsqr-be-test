import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { env } from "../config/env.js";

export const globalErrorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Default to 500 (Internal Server Error) if status code is missing
  let statusCode = 500;
  let message = "An unexpected error occurred";
  let stack: string | undefined = undefined;

  if (error instanceof AppError) {
    // It's a trusted error we created (e.g. Input validation, Logic error)
    statusCode = error.statusCode;
    message = error.message;
    stack = error.stack;
  } else if (error instanceof Error) {
    // Programming or other unknown error
    logger.error("CRITICAL ERROR 💥:", error);

    // Check environment safely
    if (env.NODE_ENV === "production") {
      message = "Something went wrong. Please try again later.";
    } else {
      message = error.message;
      stack = error.stack;
    }
  } else {
    // If error is not an instance of Error (e.g. throw "string")
    logger.error("CRITICAL ERROR 💥:", error);
    message = 'Unknown error occurred';
  }

   res.status(statusCode).json({
    status: statusCode.toString().startsWith('4') ? 'fail' : 'error',
    message,
    stack: env.NODE_ENV === 'development' ? stack : undefined,
  });
};
