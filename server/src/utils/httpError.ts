export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', code?: string) {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = 'Unauthorized', code?: string) {
    return new AppError(message, 401, code);
  }

  static forbidden(message = 'Forbidden', code?: string) {
    return new AppError(message, 403, code);
  }

  static notFound(message = 'Not found', code?: string) {
    return new AppError(message, 404, code);
  }

  static conflict(message = 'Conflict', code?: string) {
    return new AppError(message, 409, code);
  }

  static tooManyRequests(message = 'Too many requests', code?: string) {
    return new AppError(message, 429, code);
  }

  static internal(message = 'Internal server error', code?: string) {
    return new AppError(message, 500, code);
  }
}
