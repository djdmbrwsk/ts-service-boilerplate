import App from './App';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = new App();
export default app.start().catch(err => {
  app.exitWithError('Error during start()', err);
});
