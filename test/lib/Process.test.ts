import * as inspector from 'inspector';

import Process from '../../src/lib/Process';

jest.mock('inspector');

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

class MyProcess extends Process {}

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('start()', () => {
  test('should setup shutdown signal listeners that will exitGracefully()', async () => {
    const p = new MyProcess();
    const { processOnCallbacks, processOnSpy } = mockProcessOn();
    const pExitGracefullySpy = jest
      .spyOn(p, 'exitGracefully')
      .mockImplementation();

    await expect(p.start()).resolves;
    expect(processOnSpy).toBeCalledWith('SIGINT', expect.any(Function));

    const sigIntCb = processOnCallbacks['SIGINT'];
    await sigIntCb();
    expect(pExitGracefullySpy).toBeCalledWith('SIGINT', 130);
  });

  test('should setup shutdown signal listeners that will exitWithError() when unhandled error during exitGracefully()', async () => {
    const p = new MyProcess();
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

  test('should setup "uncaughtException" listener that will exitWithError()', async () => {
    const p = new MyProcess();
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

  test('should setup "unhandledRejection" listener that will exitWithError()', async () => {
    const p = new MyProcess();
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
  test('should close() inspector when open', async () => {
    const p = new MyProcess();
    const inspectorUrlSpy = jest
      .spyOn(inspector, 'url')
      .mockReturnValue('truthy-value');
    const inspectorCloseSpy = jest.spyOn(inspector, 'close');
    jest.spyOn(process, 'exit').mockImplementation();

    await expect(p.exitGracefully('SIGINT', 130)).resolves;

    expect(inspectorUrlSpy).toBeCalled();
    expect(inspectorCloseSpy).toBeCalled();
  });

  test('should exit process with correct code', async () => {
    const p = new MyProcess();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    await expect(p.exitGracefully('SIGINT', 130)).resolves;

    expect(processExitSpy).toBeCalledWith(130);
  });
});

describe('exitWithError()', () => {
  test('should log and exit', async () => {
    const p = new MyProcess();
    const processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    p.exitWithError('Some message', new Error('Some error'));

    expect(processExitSpy).toBeCalledWith(1);
  });
});
