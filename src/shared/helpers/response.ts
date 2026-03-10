import { Response } from 'express';

interface SuccessResponse {
  success: true;
  data: any;
}

interface ErrorResponse {
  success: false;
  message: string;
}

export class ResponseHelper {
  static success(res: Response, data: any, statusCode: number = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data,
    } as SuccessResponse);
  }

  static error(res: Response, statusCode: number, message: string): Response {
    return res.status(statusCode).json({
      success: false,
      message,
    } as ErrorResponse);
  }
}
