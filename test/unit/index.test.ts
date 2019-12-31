import App from '../../src/App';

const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  jest.restoreAllMocks();
  process.env.NODE_ENV = originalNodeEnv;
});

test('should default NODE_ENV when not provided', async () => {
  delete process.env.NODE_ENV;
  jest.spyOn(App.prototype, 'start').mockResolvedValue();

  await loadIsolatedIndex();
  expect(process.env.NODE_ENV).toEqual('development');
});

test('should start the App', async () => {
  const processStartSpy = jest
    .spyOn(App.prototype, 'start')
    .mockResolvedValue();

  const { default: startPromise } = await loadIsolatedIndex();
  await expect(startPromise).resolves;
  expect(processStartSpy).toBeCalledTimes(1);
});

test('should catch and exit when error occurs starting the App', async () => {
  const processStartSpy = jest
    .spyOn(App.prototype, 'start')
    .mockRejectedValue('Some error!');
  const processExitWithErrorSpy = jest
    .spyOn(App.prototype, 'exitWithError')
    .mockImplementation();

  const { default: startPromise } = await loadIsolatedIndex();
  await expect(startPromise).rejects;
  expect(processStartSpy).toBeCalledTimes(1);
  expect(processExitWithErrorSpy).toBeCalledTimes(1);
});

// Load isolated index.ts so it doesn't end up in the "require cache". Necessary
// because it executes when required/imported and we want to test it many times.
function loadIsolatedIndex(): Promise<typeof import('../../src/index')> {
  return new Promise(resolve => {
    jest.isolateModules(() => {
      /* eslint-disable-next-line @typescript-eslint/no-var-requires */
      const index = require('../../src/index');
      resolve(index);
    });
  });
}
