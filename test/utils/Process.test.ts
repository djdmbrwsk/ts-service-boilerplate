import * as inspector from 'inspector';

import App from '../../src/App';
import { Process } from '../../src/utils/Process';

jest.mock('inspector');
jest.mock('../../src/App');

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type FunctionMap = { [key: string]: (...args: any[]) => any };

function mockProcessOn(): {
  processOnCallbacks: FunctionMap;
  processOnSpy: jest.SpyInstance;
} {
  const processOnCallbacks: FunctionMap = {};
  const processOnSpy = jest
    .spyOn(process, 'on')
    .mockImplementation((event, listener) => {
      processOnCallbacks[event] = listener;
      return process;
    });
  return { processOnCallbacks, processOnSpy };
}

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('start()', () => {
  test('should only run start() once when called multiple times', async () => {
    const p = new Process();
    mockProcessOn();
    const appStartupSpy = jest.spyOn(App, 'startup');

    await expect(p.start()).resolves;
    await expect(p.start()).resolves;

    expect(appStartupSpy).toBeCalledTimes(1);
  });

  test('should setup shutdown signal listeners that will exitGracefully()', async () => {
    const p = new Process();
    const { processOnCallbacks, processOnSpy } = mockProcessOn();
    const pExitGracefullySpy = jest
      .spyOn(p, 'exitGracefully')
      .mockImplementation();

    await expect(p.start()).resolves;
    expect(processOnSpy).toBeCalledWith('SIGINT', expect.any(Function));

    const sigIntCb = processOnCallbacks['SIGINT'];
    await sigIntCb();
    expect(pExitGracefullySpy).toBeCalledWith('SIGINT', 2);
  });

  test('should setup shutdown signal listeners that will exitWithError() when unhandled error during exitGracefully()', async () => {
    const p = new Process();
    const { processOnCallbacks, processOnSpy } = mockProcessOn();
    jest.spyOn(p, 'exitGracefully').mockRejectedValue(new Error('Some error'));
    const pExitWithErrorSpy = jest
      .spyOn(p, 'exitWithError')
      .mockImplementation();

    await expect(p.start()).resolves;
    expect(processOnSpy).toBeCalledWith('SIGINT', expect.any(Function));

    const sigIntCb = processOnCallbacks['SIGINT'];
    await sigIntCb();
    expect(pExitWithErrorSpy).toBeCalledWith(
      'Error during exitGracefully()',
      expect.any(Error),
    );
  });

  test('should setup uncaugnt exception listener that will exitWithError()', async () => {
    const p = new Process();
    const { processOnCallbacks, processOnSpy } = mockProcessOn();
    const pExitWithErrorSpy = jest
      .spyOn(p, 'exitWithError')
      .mockImplementation();

    await expect(p.start()).resolves;
    expect(processOnSpy).toBeCalledWith(
      'uncaughtException',
      expect.any(Function),
    );

    const uncaughtExceptionCb = processOnCallbacks['uncaughtException'];
    uncaughtExceptionCb(new Error('Some error'));
    expect(pExitWithErrorSpy).toBeCalledWith(
      'Uncaught exception',
      expect.any(Error),
    );
  });

  test('should setup unhandled rejection listener that will exitWithError()', async () => {
    const p = new Process();
    const { processOnCallbacks, processOnSpy } = mockProcessOn();
    const pExitWithErrorSpy = jest
      .spyOn(p, 'exitWithError')
      .mockImplementation();

    await expect(p.start()).resolves;
    expect(processOnSpy).toBeCalledWith(
      'unhandledRejection',
      expect.any(Function),
    );

    const unhandledRejection = processOnCallbacks['unhandledRejection'];
    unhandledRejection(new Error('Some error'));
    expect(pExitWithErrorSpy).toBeCalledWith(
      'Unhandled rejection',
      expect.any(Error),
    );
  });
});

describe('exitGracefully()', () => {
  test('should only run exitGracefully() once when called multiple times', async () => {
    const p = new Process();
    jest.spyOn(process, 'exit').mockImplementation();
    const appShutdownSpy = jest.spyOn(App, 'shutdown');

    await expect(p.exitGracefully('SIGINT', 2)).resolves;
    await expect(p.exitGracefully('SIGINT', 2)).resolves;

    expect(appShutdownSpy).toBeCalledWith('SIGINT', 130);
  });

  test('should close() inspector when open', async () => {
    const p = new Process();
    const inspectorUrlSpy = jest
      .spyOn(inspector, 'url')
      .mockReturnValue('truthy-value');
    const inspectorCloseSpy = jest.spyOn(inspector, 'close');
    jest.spyOn(process, 'exit').mockImplementation();

    await expect(p.exitGracefully('SIGINT', 2)).resolves;

    expect(inspectorUrlSpy).toBeCalled();
    expect(inspectorCloseSpy).toBeCalled();
  });
});

describe('exitWithError()', () => {
  test('should log and exit', async () => {
    const p = new Process();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    p.exitWithError('Some message', new Error('Some error'));

    expect(consoleErrorSpy).toBeCalledWith('Some message', expect.any(Error));
    expect(processExitSpy).toBeCalledWith(1);
  });
});
