import { Request, Response } from 'express';

import ErrorResponse from './ErrorResponse';

export default async function(req: Request, res: Response): Promise<void> {
  const errRes: ErrorResponse = {
    code: 404,
    message: 'Not Found',
  };
  res.status(errRes.code).send(errRes);
}
