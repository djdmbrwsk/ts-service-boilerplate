import { Server } from 'http';

import App from '../../src/App';
import Process from '../../src/lib/Process';

jest.mock('../../src/lib/Process');

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(Server.prototype, 'listen').mockImplementation();
});

test('should start() and exitGracefully()', async () => {
  const app = new App();
  await expect(app.start()).resolves;
  await expect(app.exitGracefully('SIGINT', 130)).resolves;
});

test('should call super.start()', async () => {
  const processStartSpy = jest.spyOn(Process.prototype, 'start');

  const app = new App();
  await expect(app.start()).resolves;
  expect(processStartSpy).toBeCalled();
});

test('should call super.exitGracefully()', async () => {
  const processExitGracefullySpy = jest.spyOn(
    Process.prototype,
    'exitGracefully',
  );

  const app = new App();
  await expect(app.start()).resolves;
  await expect(app.exitGracefully('SIGINT', 130)).resolves;
  expect(processExitGracefullySpy).toBeCalled();
});

test('should call super.exitWithError()', async () => {
  const processExitWithErrorSpy = jest.spyOn(
    Process.prototype,
    'exitWithError',
  );

  const app = new App();
  await expect(app.start()).resolves;
  app.exitWithError('Some error');
  expect(processExitWithErrorSpy).toBeCalled();
});

test('should exitGracefully() when configuration incomplete', async () => {
  jest.spyOn(App.prototype, 'start').mockResolvedValue();

  const app = new App();
  await expect(app.start()).resolves;
  await expect(app.exitGracefully('SIGINT', 130)).resolves;
});
