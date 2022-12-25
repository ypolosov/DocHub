const pluginName = 'PluginMakerWebpackPlugin';

const { ConcatSource } = require('webpack-sources');

module.exports = class PluginMakerWebpackPlugin {
	constructor(options) {
		this.options = Object.assign(options || {}, {
			filer: /^plugins\/.*\.js$/
		});
		this.options.test = new RegExp(this.options.test);
	}
	apply(compiler) {
		compiler.hooks.compilation.tap(pluginName, compilation => {
			compilation.hooks.processAssets.tap(
				{
					name: pluginName,
					stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS
				}, 
				() => {
					for (const chunk of compilation.chunks) {
						for (const file of chunk.files) {
							if (this.options.filer.test(file)) {
								compilation.updateAsset(file, old => {
									return new ConcatSource('(function (DocHub){', old, '})(window.DocHub);');
								});
							}
						}
					}
				});
		});
	}
};
