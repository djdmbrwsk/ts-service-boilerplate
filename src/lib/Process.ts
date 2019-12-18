import * as inspector from 'inspector';

export default abstract class Process {
  public async start(): Promise<void> {
    const signals = new Map<NodeJS.Signals, number>([
      ['SIGHUP', 1],
      ['SIGINT', 2],
      ['SIGTERM', 15],
      ['SIGUSR1', 10],
      ['SIGUSR2', 12],
    ]);
    signals.forEach((value, signal) => {
      process.on(signal, async () => {
        try {
          const code = 128 + value;
          await this.exitGracefully(signal, code);
        } catch (err) {
          this.exitWithError('Error during exitGracefully()', err);
        }
      });
    });

    process.on('uncaughtException', err => {
      this.exitWithError('Uncaught exception', err);
    });

    process.on('unhandledRejection', reason => {
      this.exitWithError('Unhandled rejection', reason);
    });
  }

  public async exitGracefully(
    signal: NodeJS.Signals,
    code: number,
  ): Promise<void> {
    if (inspector.url()) {
      inspector.close();
    }
    process.exit(code);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
  public exitWithError(message: string, error?: any): void {
    process.exit(1);
  }
}
