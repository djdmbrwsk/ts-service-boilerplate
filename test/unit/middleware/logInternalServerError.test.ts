import winston from 'winston';

import logInternalServerError from '../../../src/middleware/logInternalServerError';

afterEach(() => {
  jest.restoreAllMocks();
});

test('should log error and continue to the next route', async () => {
  const errorSpy = jest.spyOn(winston, 'error');
  const nextMock = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reqResMock: any = undefined;

  // Suppress "no transports" winston warning
  winston.configure({ silent: true });

  logInternalServerError(
    new Error('Some error'),
    reqResMock,
    reqResMock,
    nextMock,
  );

  expect(errorSpy).toBeCalled();
  expect(nextMock).toBeCalled();
});
