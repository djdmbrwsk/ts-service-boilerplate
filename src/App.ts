import { config as dotenvCraConfig } from 'dotenv-cra';
import express, { Express, NextFunction, Request, Response } from 'express';
import http, { Server } from 'http';
import morgan from 'morgan';
import winston from 'winston';

import { RootController } from './controllers';
import loadPackageEnv from './lib/loadPackageEnv';
import { notFound, internalServerError } from './lib/handlers';
import Process from './lib/Process';
import buildLoggingDefaultMeta from './utils/buildLoggingDefaultMeta';

export default class App extends Process {
  public app?: Express;
  public server?: Server;

  public async start(): Promise<void> {
    // TODO: Remove after done debugging
    // await new Promise(resolve => setTimeout(resolve, 3000));

    // Call Process.start() first to setup process.on() handlers
    await super.start();

    // Load the appropriate config into process.env before anything else
    dotenvCraConfig();
    loadPackageEnv();

    // Start your app
    this.configureWinston();
    this.configureExpress();
    const { NODE_ENV, PACKAGE_NAME, PACKAGE_VERSION } = process.env;
    winston.info(
      `Starting ${PACKAGE_NAME} v${PACKAGE_VERSION} in "${NODE_ENV}" mode...`,
    );
  }

  public async exitGracefully(
    signal: NodeJS.Signals,
    code: number,
  ): Promise<void> {
    // Stop your app
    winston.info(`Graceful exit triggered by ${signal} with code ${code}...`);
    this.server?.close();

    // Call Process.exitGracefully() last to facilitate process.exit()
    await super.exitGracefully(signal, code);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public exitWithError(message: string, error?: any): void {
    // Log the error
    winston.error(`${message}: `, error);

    // Call Process.exitWithError() last to facilitate process.exit()
    super.exitWithError(message, error);
  }

  private configureWinston(): void {
    winston.configure({
      silent: process.env.LOGGING_ENABLED !== 'true',
      level: process.env.LOG_LEVEL,
      defaultMeta: buildLoggingDefaultMeta(),
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple(),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  private configureExpress(): void {
    require('express-async-errors');

    this.app = express();
    this.server = http.createServer(this.app);

    this.app.use(morgan('combined', { stream: { write: winston.debug } }));

    this.app.use('/', new RootController().router);

    // TODO: Remove once integration tests
    this.app.get('/break', async () => {
      throw new Error('Some error');
    });

    this.app.use(notFound);
    this.app.use((
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      err: any,
      req: Request,
      res: Response,
      next: NextFunction,
    ): void => {
      winston.error('500 Internal Server Error: ', err);
      next(err);
    }, internalServerError);

    const port = Number(process.env.PORT) || 3000;
    this.app.set('port', port);
    this.server.listen(port);
  }
}
