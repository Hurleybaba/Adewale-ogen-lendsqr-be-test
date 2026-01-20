import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

export const globalErrorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default to 500 (Internal Server Error) if status code is missing
  let statusCode = 500;
  let message = 'An unexpected error occurred';

  if (error instanceof AppError) {
    // It's a trusted error we created (e.g. Input validation, Logic error)
    statusCode = error.statusCode;
    message = error.message;
  } else {
    // It's an unknown programming bug (e.g. Database connection died, Null pointer)
    // Log the FULL error for the developer to fix
    logger.error('CRITICAL ERROR 💥:', error);
    
    // In production, don't leak details to the client
    if (process.env.NODE_ENV === 'production') {
      message = 'Something went wrong. Please try again later.';
    } else {
      // In development, send the error message for debugging
      message = error.message;
    }
  }

  res.status(statusCode).json({
    status: statusCode.toString().startsWith('4') ? 'fail' : 'error',
    message,
    // Only show stack trace in development
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};