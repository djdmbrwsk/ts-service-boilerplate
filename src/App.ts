import { config as dotenvCraConfig } from 'dotenv-cra';
import express, { Express } from 'express';
import http, { Server } from 'http';
import morgan from 'morgan';
import winston from 'winston';

import { RootController } from './controllers';
import { logInternalServerError } from './middleware';
import loadPackageEnv from './lib/loadPackageEnv';
import { notFound, internalServerError } from './lib/middleware';
import Process from './lib/Process';
import buildLoggingDefaultMeta from './utils/buildLoggingDefaultMeta';

export default class App extends Process {
  public express?: Express;
  public server?: Server;

  public async start(): Promise<void> {
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

    this.express = express();
    this.server = http.createServer(this.express);

    this.express.use(morgan('combined', { stream: { write: winston.debug } }));

    this.express.use('/', new RootController().router);

    this.express.use(notFound);
    this.express.use(logInternalServerError, internalServerError);

    const port = Number(process.env.PORT);
    this.express.set('port', port);
    this.server.listen(port);
  }
}
