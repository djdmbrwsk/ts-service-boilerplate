class App {
  private running = false;

  public async startup(): Promise<void> {
    console.debug('App starting up...');
    this.run();
  }

  public async shutdown(signal: NodeJS.Signals, value: number): Promise<void> {
    console.debug(`App shutdown triggered by ${signal} with code ${value}...`);
    this.running = false;
  }

  private async run(): Promise<void> {
    this.running = true;
    while (this.running) {
      console.debug('App running...');
      await this.timeout(1000);
    }
  }

  private async timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new App();
