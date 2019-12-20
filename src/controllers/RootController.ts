import { Request, Response } from 'express';

import Controller from '../lib/Controller';

export default class HealthController extends Controller {
  public async root(req: Request, res: Response): Promise<void> {
    res.status(200).send({
      /* eslint-disable @typescript-eslint/camelcase */
      app: process.env.PACKAGE_NAME,
      version: process.env.PACKAGE_VERSION,
      node_env: process.env.NODE_ENV,
      /* eslint-enable @typescript-eslint/camelcase */
    });
  }

  protected setupRoutes(): void {
    this.router.get('/', this.root);
  }
}
