import Process from '../src/utils/Process';

// Load isolated index.ts so it doesn't end up in the "require cache". Necessary
// because it executes when required/imported and we want to test it many times.
function loadIsolatedIndex(): Promise<typeof import('../src/index')> {
  return new Promise(resolve => {
    jest.isolateModules(() => {
      /* eslint-disable @typescript-eslint/no-var-requires */
      const index = require('../src/index');
      resolve(index);
    });
  });
}

beforeEach(() => {
  jest.restoreAllMocks();
});

test('should start process', async () => {
  const processStartSpy = jest.spyOn(Process, 'start').mockResolvedValue();

  const { default: startPromise } = await loadIsolatedIndex();
  await expect(startPromise).resolves;
  expect(processStartSpy).toBeCalledTimes(1);
});

test('should catch and exit when error occurs starting process', async () => {
  const processStartSpy = jest
    .spyOn(Process, 'start')
    .mockRejectedValue('Some error!');
  const processExitWithErrorSpy = jest
    .spyOn(Process, 'exitWithError')
    .mockImplementation();

  const { default: startPromise } = await loadIsolatedIndex();
  await expect(startPromise).rejects;
  expect(processStartSpy).toBeCalledTimes(1);
  expect(processExitWithErrorSpy).toBeCalledTimes(1);
});
