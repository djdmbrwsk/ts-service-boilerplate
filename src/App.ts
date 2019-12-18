import Process from './lib/Process';

export default class App extends Process {
  private running = false;

  public async start(): Promise<void> {
    // Call Process.start() first to setup process.on() handlers
    await super.start();

    // Start your app
    console.debug('App starting up...');
    this.run();
  }

  public async exitGracefully(
    signal: NodeJS.Signals,
    code: number,
  ): Promise<void> {
    // Stop your app
    console.debug(`App shutdown triggered by ${signal} with code ${code}...`);
    this.running = false;

    // Call Process.exitGracefully() last to facilitate process.exit()
    await super.exitGracefully(signal, code);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public exitWithError(message: string, error?: any): void {
    // Log the error
    console.error(message, error);

    // Call Process.exitWithError() last to facilitate process.exit()
    super.exitWithError(message, error);
  }

  private async run(): Promise<void> {
    this.running = true;
    while (this.running && process.env.NODE_ENV !== 'test') {
      console.debug('App running...');
      await this.timeout(1000);
    }
  }

  private async timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
