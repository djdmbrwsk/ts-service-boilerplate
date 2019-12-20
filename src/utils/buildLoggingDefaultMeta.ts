/* eslint-disable @typescript-eslint/no-explicit-any */
export default function(): any {
  return {
    /* eslint-disable @typescript-eslint/camelcase */
    app: process.env.PACKAGE_NAME,
    version: process.env.PACKAGE_VERSION,
    node_env: process.env.NODE_ENV,
    /* eslint-enable @typescript-eslint/camelcase */
  };
}
