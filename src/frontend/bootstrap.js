import env from '@front/helpers/env';

const plugins = {
  components: [],
  pull() {
    this.components.forEach((el) => DocHub.documents.register(el.type, el.component));
  },
  push(type, component) {
    this.components.push({type, component});
  }
};

window.DocHub = {
  registerPlugin: plugins.push.bind(plugins)
};

const beforeInit = (processEnv) => {
  env.dochub.processEnv = processEnv ?? {};
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
