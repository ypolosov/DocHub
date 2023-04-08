const plugins = {
  documents: [],
  pull() {
    this.documents.forEach((el) => DocHub.registerDocuments(el.type, el.component));
  }
};

window.DocHub = {
  documents: {
    register(type, component) {
      plugins.documents.push({type, component});
    }
  }
};

export {
  plugins
};
