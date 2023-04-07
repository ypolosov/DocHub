import env from '@front/helpers/env';
import {plugins} from '@front/plugins/initializer.js';

const beforeInit = (processEnv) => {
  env.dochub = processEnv ?? {};
};

const init = async() => {
  const { default: app } = await import(/* webpackMode: "eager" */ './index');

  await import(/* webpackMode: "eager" */ '@front/plugins/api');

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
