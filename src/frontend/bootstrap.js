import env from '@front/helpers/env';
import {plugins} from '@front/plugins/initializer.js';

const beforeInit = (processEnv) => {
  env.dochub = processEnv ?? {};
  import(/* webpackMode: "eager" */ '@front/plugins/api');
};

const init = async() => {
  const { default: app } = await import(/* webpackMode: "eager" */ './index');
  return app;
};

const afterInit = () => {
  plugins.pull();
};

export {
  beforeInit,
  init,
  afterInit
};
