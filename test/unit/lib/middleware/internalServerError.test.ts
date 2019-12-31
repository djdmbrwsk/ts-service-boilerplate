import internalServerError from '../../../../src/lib/middleware/internalServerError';

const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  jest.restoreAllMocks();
  process.env.NODE_ENV = originalNodeEnv;
});

test('should respond with simple ErrorResponse when NOT in "development" environment', async () => {
  process.env.NODE_ENV = 'production';
  const err = new Error('Some error');
  const req = {};
  const res = { status: jest.fn(), send: jest.fn() };
  const next = jest.fn();

  const statusSpy = jest.spyOn(res, 'status').mockReturnValue(res);
  const sendSpy = jest.spyOn(res, 'send').mockReturnValue(res);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  await internalServerError(err, req as any, res as any, next);

  expect(statusSpy).toBeCalledWith(500);
  expect(sendSpy).toBeCalledWith({
    code: 500,
    message: 'Internal Server Error',
  });
});

test('should respond with detailed ErrorResponse when in "development" environment', async () => {
  process.env.NODE_ENV = 'development';
  const err = new Error('Some error');
  const req = {};
  const res = { status: jest.fn(), send: jest.fn() };
  const next = jest.fn();

  const statusSpy = jest.spyOn(res, 'status').mockReturnValue(res);
  const sendSpy = jest.spyOn(res, 'send').mockReturnValue(res);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  await internalServerError(err, req as any, res as any, next);

  expect(statusSpy).toBeCalledWith(500);
  expect(sendSpy).toBeCalledWith({
    code: 500,
    message: 'Internal Server Error',
    data: {
      message: err.message,
      stack: err.stack,
    },
  });
});

test('should respond with simple ErrorResponse when error missing fields in "development" environment', async () => {
  process.env.NODE_ENV = 'development';
  const req = {};
  const res = { status: jest.fn(), send: jest.fn() };
  const next = jest.fn();

  const statusSpy = jest.spyOn(res, 'status').mockReturnValue(res);
  const sendSpy = jest.spyOn(res, 'send').mockReturnValue(res);

  const testCases = [
    { message: '' }, // No message
    { stack: '' }, // No stack
  ];
  for (const testCase of testCases) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    await internalServerError(testCase, req as any, res as any, next);

    expect(statusSpy).toBeCalledWith(500);
    expect(sendSpy).lastCalledWith({
      code: 500,
      message: 'Internal Server Error',
      data: testCase,
    });
  }
});
