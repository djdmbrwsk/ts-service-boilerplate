import App from './App';

const app = new App();
export default app.start().catch(err => {
  app.exitWithError('Error during start()', err);
});
