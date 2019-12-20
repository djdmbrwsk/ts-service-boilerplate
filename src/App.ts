import Process from './lib/Process';
import { config as dotenvCraConfig } from 'dotenv-cra';

import loadPackageEnv from './lib/loadPackageEnv';

let LOG = true;

export default class App extends Process {
  private running = false;

  public async start(): Promise<void> {
    // TODO: Remove
    // await this.timeout(3000);

    // Call Process.start() first to setup process.on() handlers
    await super.start();

    // Load the appropriate config into process.env before anything else
    dotenvCraConfig();
    loadPackageEnv();

    // Start your app
    const { NODE_ENV, PACKAGE_NAME, PACKAGE_VERSION } = process.env;
    LOG = process.env.LOGGING_ENABLED === 'true';
    LOG &&
      console.debug(
        `Starting ${PACKAGE_NAME} v${PACKAGE_VERSION} in "${NODE_ENV}" mode...`,
      );
    this.run();
  }

  public async exitGracefully(
    signal: NodeJS.Signals,
    code: number,
  ): Promise<void> {
    // Stop your app
    LOG &&
      console.debug(
        `Graceful exit triggered by ${signal} with code ${code}...`,
      );
    this.running = false;

    // Call Process.exitGracefully() last to facilitate process.exit()
    await super.exitGracefully(signal, code);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public exitWithError(message: string, error?: any): void {
    // Log the error
    LOG && console.error(message, error);

    // Call Process.exitWithError() last to facilitate process.exit()
    super.exitWithError(message, error);
  }

  private async run(): Promise<void> {
    this.running = true;
    while (this.running && process.env.NODE_ENV !== 'test') {
      LOG && console.debug('App running...');
      await this.timeout(1000);
    }
  }

  private async timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
