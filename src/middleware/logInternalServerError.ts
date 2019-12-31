import { NextFunction, Request, Response } from 'express';
import winston from 'winston';

/**
 * Note all 4 parameters are required for the typings to detect this as the
 * express error handler
 */
export default async function(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  winston.error('500 Internal Server Error: ', err);
  next(err);
}
