import { readFileSync } from 'fs';
import findUp from 'find-up';

export default function(): void {
  const packageJsonPath = findUp.sync('package.json');
  if (!packageJsonPath) {
    throw new Error('Unable to find a package.json file in parent directories');
  }
  const pkg = JSON.parse(readFileSync(packageJsonPath).toString('utf8'));

  if (!pkg.name) {
    throw new Error('No `name` key found in package.json');
  }
  process.env.PACKAGE_NAME = pkg.name;

  if (!pkg.version) {
    throw new Error('No `version` key found in package.json');
  }
  process.env.PACKAGE_VERSION = pkg.version;
}
