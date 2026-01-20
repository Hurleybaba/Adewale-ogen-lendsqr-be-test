export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Operational errors are known issues (e.g., "User not found") that we want to handle gracefully
    this.isOperational = true;

    // Captures the stack trace effectively so we know where the error happened
    Error.captureStackTrace(this, this.constructor);
  }
}