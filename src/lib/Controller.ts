import { Router, RouterOptions } from 'express';

export default abstract class Controller {
  public readonly router: Router;

  constructor(options?: RouterOptions) {
    this.router = Router(options);
    this.setupRoutes();
  }

  protected abstract setupRoutes(): void;
}
