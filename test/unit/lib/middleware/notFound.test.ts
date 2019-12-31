import notFound from '../../../../src/lib/middleware/notFound';

afterEach(() => {
  jest.restoreAllMocks();
});

test('should respond with appropriate ErrorResponse', async () => {
  const req = {};
  const res = { status: jest.fn(), send: jest.fn() };

  const statusSpy = jest.spyOn(res, 'status').mockReturnValue(res);
  const sendSpy = jest.spyOn(res, 'send').mockReturnValue(res);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  await notFound(req as any, res as any);

  expect(statusSpy).toBeCalledWith(404);
  expect(sendSpy).toBeCalledWith({ code: 404, message: 'Not Found' });
});
