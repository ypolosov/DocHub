import { v4 as uuidv4 } from 'uuid';

import plantuml from '@/helpers/plantuml';
import config from '../../config';

const emit = (command: string, content: any): Promise<any> | void =>
  vscode.postMessage({command, content});

const initSettings = () => {
  config.root_manifest = window.DochubVsCodeExt.rootManifest;
  config.pumlServer = window.$PAPI?.settings?.render?.server
    || process.env.VUE_APP_PLANTUML_SERVER
    || 'www.plantuml.com/plantuml/svg/';
  config.pumlRequestType = window.$PAPI?.settings?.render?.request_type
    || 'get';
};

export const listeners: { [key: string]: any } = {};

export default (): void => {
  window.$PAPI = {
    settings: window.DochubVsCodeExt.settings,
    checkIsRootManifest(): void {
      emit('check-is-root-manifest', '');
    },
    initProject(mode): void {
      emit('create', mode);
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
    reload(): void {
      emit('reload-force', '');
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

  initSettings();
};
