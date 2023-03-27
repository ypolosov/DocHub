import { beforeInit, init, afterInit } from './bootstrap';

beforeInit(process.env);

document.addEventListener('DOMContentLoaded', async() => {
  const {
    Vue,
    Root,
    router,
    vuetify,
    store
  } = await init();

  afterInit();

  new Vue({
    router,
    render(createElement) {
      return createElement(Root);
    },
    vuetify,
    store
  }).$mount('#app');

});
