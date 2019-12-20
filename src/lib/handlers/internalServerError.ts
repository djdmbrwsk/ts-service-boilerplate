import { NextFunction, Request, Response } from 'express';

import ErrorResponse from './ErrorResponse';

/**
 * Note all 4 parameters are required for the typings to detect this as the
 * express error handler
 */
export default async function(
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
): Promise<void> {
  const errRes: ErrorResponse = {
    code: 500,
    message: 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    if (err.message !== undefined) {
      errRes.data = errRes.data || {};
      errRes.data.message = err.message;
    }
    if (err.stack !== undefined) {
      errRes.data = errRes.data || {};
      errRes.data.stack = err.stack;
    }
  }

  res.status(errRes.code).send(errRes);
}
