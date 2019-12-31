import fs from 'fs';
import findUp from 'find-up';

import loadPackageEnv from '../../src/lib/loadPackageEnv';

beforeEach(() => {
  jest.restoreAllMocks();
});

test('should load package details into process.env', async () => {
  delete process.env.PACKAGE_NAME;
  delete process.env.PACKAGE_VERSION;

  loadPackageEnv();

  expect(process.env.PACKAGE_NAME).toBeTruthy();
  expect(process.env.PACKAGE_VERSION).toBeTruthy();
});

test('should error when package.json not found in parent directory', async () => {
  jest.spyOn(findUp, 'sync').mockReturnValue(undefined);
  expect(() => loadPackageEnv()).toThrowError(
    'Unable to find a package.json file in parent directories',
  );
});

test('should error when `name` not found in package.json', async () => {
  jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');
  expect(() => loadPackageEnv()).toThrowError(
    'No `name` key found in package.json',
  );
});

test('should error when `version` not found in package.json', async () => {
  jest.spyOn(fs, 'readFileSync').mockReturnValue('{ "name": "some-package" }');
  expect(() => loadPackageEnv()).toThrowError(
    'No `version` key found in package.json',
  );
});
