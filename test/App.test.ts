import App from '../src/App';

afterEach(() => {
  jest.restoreAllMocks();
});

test('should startup() and shutdown()', async () => {
  await expect(App.startup()).resolves;
  await expect(App.shutdown('SIGINT', 130)).resolves;
});
