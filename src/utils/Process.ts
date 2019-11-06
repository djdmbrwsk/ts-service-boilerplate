import * as inspector from 'inspector';

import App from '../App';

export class Process {
  private isStarting = false;
  private isExiting = false;

  public async start(): Promise<void> {
    if (this.isStarting) return;
    this.isStarting = true;

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
          await this.exitGracefully(signal, value);
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

    await App.startup();
  }

  public async exitGracefully(
    signal: NodeJS.Signals,
    value: number,
  ): Promise<void> {
    if (this.isExiting) return;
    this.isExiting = true;

    const code = 128 + value;
    await App.shutdown(signal, code);

    if (inspector.url()) {
      inspector.close();
    }
    process.exit(code);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public exitWithError(message: string, error?: any): void {
    console.error(message, error);
    process.exit(1);
  }
}

export default new Process();
