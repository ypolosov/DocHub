import { v4 as uuidv4 } from 'uuid';

import plantuml from '@front/helpers/plantuml';
import config from '@front/config';

const emit = (command: string, content: any): Promise<any> | void =>
  vscode.postMessage({command, content});

export const listeners: { [key: string]: any } = {};

export default (): void => {
  window.$PAPI = {
    settings: window.DochubVsCodeExt.settings,
    checkIsRootManifest(): void {
      emit('check-is-root-manifest', '');
    },
    pluginList(plugins) {
      emit('pluginList', plugins);
    },
    loaded() {
      emit('loaded', '');
    },
    initProject(mode): void {
      emit('create', mode);
    },
    addLinks(node): void {
      emit('addLinks', node);
    },
    applyEntitiesSchema(schema) {
      emit('applyschema', JSON.stringify({ schema }));
    },
    debug() {
      emit('debug', undefined);
    },
    download(content, title, description): void {
      const stringifedUri = JSON.stringify({
        content, title, description
      });

      emit('download', stringifedUri);
    },
    goto(href): void {
      emit('goto', JSON.stringify(href));
    },
    reload(currentRoute): void {
      emit('reload-force', { currentRoute });
    },
    renderPlantUML(uml): Promise<void> {
      const stringifedUri = JSON.stringify(plantuml.svgURL(uml));
      const uuid = uuidv4();

      emit('plantuml', {
        stringifedUri,
        uuid
      });

      return new Promise((res, rej): void => {
        listeners[uuid] = { res, rej };
      });
    },
    request(uri): Promise<void> {
      const stringifedUri = JSON.stringify(uri);
      const uuid = uuidv4();

      emit('request', {
        stringifedUri,
        uuid
      });

      return new Promise((res, rej): void => {
        listeners[uuid] = { res, rej };
      });
    }
  };
};
