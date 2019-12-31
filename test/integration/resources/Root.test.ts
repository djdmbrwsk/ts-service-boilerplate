import { Express } from 'express';
import { Server } from 'http';
import request from 'supertest';

import App from '../../../src/App';

jest.mock('../../../src/lib/Process');

let express: Express | undefined;

beforeAll(async () => {
  jest.spyOn(Server.prototype, 'listen').mockImplementation();
  const app = new App();
  await app.start();
  express = app.express;
});

beforeEach(() => {
  jest.restoreAllMocks();
});

test('should respond with app details', async () => {
  const res = await request(express)
    .get('/')
    .send()
    .expect('Content-Type', /json/)
    .expect(200);

  const body = res.body;
  expect(body).toHaveProperty('app');
  expect(body).toHaveProperty('version');
  expect(body).toHaveProperty('node_env');
});
