const { execSync } = require('child_process');
const { defineConfig } = require('@vue/cli-service');

const CONFIG_PATH = 'vue.lib.js';
const ENTRY_PATH = './src/index.js';
const EXEC_COMMAND = [
  `VUE_CLI_SERVICE_CONFIG_PATH=$PWD/${CONFIG_PATH}`,
  'vue-cli-service build',
  `--target lib ${ENTRY_PATH}`
];

const config = defineConfig({
  transpileDependencies: ['vueitfy'],
  productionSourceMap: false,
  publicPath: './',
  css: {
    sourceMap: false
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                compilerOptions: {
                  noEmit: false
                }
              }
            }
          ]
        },
        {
          test: /\.(ttf|otf|eot|woff|woff2)$/,
          type: 'asset/resource',
          generator: {
            filename: './fonts/[name][ext]'
          }
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    }
  }
});

(() => {
 if(process.argv.length < 3) {
   execSync(`${EXEC_COMMAND}`.replace(/,/g, ' '), {
     stdio: 'inherit',
     encoding: 'utf8'
   });
   execSync('chmod -R 777 ./dist');
   execSync('mv ./dist/dochub.umd.min.js ./dist/dochub.js');
   execSync('rm -rf ./dist/*umd* ./dist/*common* ./dist/*html*');
 }
})();

module.exports = config;
