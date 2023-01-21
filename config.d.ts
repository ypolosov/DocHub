// eslint-disable-next-line no-var
declare var DochubVsCodeExt: {
  rootManifest: string,
  settings: {
    render: {
      external: boolean,
      mode: string,
      request_type: string,
      server: string
    }
  }
};

declare const vscode: {
  postMessage: ({
    command,
    content
  }: {
    command: string,
    content: any
  }) => Promise<any> | void
};

interface Window { $PAPI: any; }
