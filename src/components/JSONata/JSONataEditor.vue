<template>
  <div />
</template>

<script>

  import * as monaco from 'monaco-editor';

  monaco.languages.register({id: 'jsonata'});
  monaco.languages.setMonarchTokensProvider('jsonata', {
    keywords: ['function'],
    functions: ['$spread'],
    special: ['$log('],
    tokenizer: {
      root: [
        [/@?\$[a-zA-Z][\w$]*\(/, {
          cases: {
            '@special': 'special',
            '@default': 'function'
          }
        }],
        [/@?[a-zA-Z][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'data'
          }
        }],
        [/@?\$[a-zA-Z][\w$]*/, 'variable'],
        [/".*?"/, 'string'],
        [/\/*.*?\*\//, 'comment']
      ]
    }
  });
  
  monaco.editor.defineTheme('jsonata-theme', {
    base: 'vs',
    rules: [
      { token : 'comment', foreground: '#008000' },
      { token: 'keyword', foreground: '#000000', fontStyle: 'bold' },
      { token: 'special', foreground: '#ff0000', fontStyle: 'bold' },
      { token: 'variable', foreground: '#2233ee' },
      { token: 'function', foreground: '#2233ee', fontStyle: 'bold'}
    ],
    colors: {
      'editor.foreground': '#000000'
    }    
  });

  monaco.editor.setTheme('jsonata-theme');
  
  // https://ohdarling88.medium.com/4-steps-to-add-custom-language-support-to-monaco-editor-5075eafa156d
  // https://blog.expo.dev/building-a-code-editor-with-monaco-f84b3a06deaf

  export default {
    name: 'JSONataEditor',
    props: {
      value: {
        type: String,
        default: ''
      } 
    },
    data() {
      return {
        model: null,
        editor: null
      };
    },
    mounted() {
      this.model = monaco.editor.createModel(this.value, 'jsonata');
      this.model.onDidChangeContent(() => {
        this.$emit('input', this.editor.getValue());
      });
      this.editor = monaco.editor.create(this.$el, {
        automaticLayout: true
      });
      this.editor.setModel(this.model);
    },
    unmounted() {
      this.editor.dispose();
    }
  };
</script>

<style scoped>

</style>
