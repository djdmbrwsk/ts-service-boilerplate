import Process from './utils/Process';

export default Process.start().catch(err => {
  Process.exitWithError('Error during startup()', err);
});
