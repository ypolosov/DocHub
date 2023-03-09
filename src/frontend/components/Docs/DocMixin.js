import datasets from '@front/helpers/datasets';
import gateway from '@idea/gateway';
import docs from '@front/helpers/docs';
import query from '@front/manifest/query';
import uriTool from '@front/helpers/uri';

const SOURCE_PENGING = 'pending';
const SOURCE_READY = 'ready';
const SOURCE_ERROR = 'error';

export default {
	components: {
		Box: {
			template: `
			<div v-on:contextmenu="onContextMenu">
				<v-alert v-for="error in errors" v-bind:key="error.key" type="error" style="white-space: pre-wrap;">
					{{error.message}}
				</v-alert>
				<slot v-if="!errors.length"></slot>
			</div>`,

			created: function() {
				this.$parent.$on('appendError', (error) => this.errors.push(
					{
						key: Date.now(),
						message: (error?.message || error).slice(0, 1024).toString()
					}
				));
				this.$parent.$on('clearErrors', () => this.errors = []);
			},
			methods: {
				onContextMenu(event) {
					this.$parent.$emit('showContextMenu', event);
				}
			},
			data() {
				return { errors: [] };
			}
		}
	},
	methods: {
		makeDataLakeID(path) {
			return `("${path.slice(1).split('/').join('"."')}")`;
		},
		doRefresh() {
			this.error = null;
			if (this.source.refreshTimer) clearTimeout(this.source.refreshTimer);
			this.source.refreshTimer = setTimeout(() =>{
				this.profile = null;
				const dateLakeId = this.makeDataLakeID(this.path);
				query.expression(dateLakeId).evaluate()
					.then((data) => {
						// Проверяем, что результат запроса не устарел
						if (dateLakeId === this.makeDataLakeID(this.path)) {
							this.profile = data;
							this.refresh();
						}
					})
					.catch((e) => this.error = e);
			}, 100);
		},
		refresh() {
			this.sourceRefresh();
		},
		sourceRefresh() {
			return new Promise((success, reject) => {
				this.source.status = SOURCE_PENGING;
				this.source.dataset = null;
				if (this.isTemplate && this.profile?.source) {
					this.source.provider.releaseData(this.path, this.params)
						.then((dataset) => {
							this.source.dataset = dataset;
							this.source.status = SOURCE_READY;
							success(dataset);
						})
						.catch((e) => {
							this.error = e;
							this.source.status = SOURCE_ERROR;
							reject(e);
						});
				} else {
					this.source.dataset = null;
					success(this.source.dataset);
				}
			});
		},
		onChangeSource(data) {
			if (data) {
				for (const source in data) {
					if (source === this.url.split('?')[0]) {
						this.doRefresh();
					}
				}
			}
		},
		showContextMenu(event) {
			event.preventDefault();
			this.menu.show = false;
			this.menu.x = event.clientX;
			this.menu.y = event.clientY;
			this.$nextTick(() => {
				this.menu.show = true;
			});
		}
	},
	computed: {
		id() {
			return this.path.split('/').pop();
		},
		isTemplate() {
			return this.profile?.template;
		},
		baseURI() {
			return uriTool.getBaseURIOfPath(this.path);
		},
		url() {
			let result = this.profile ? docs.urlFromProfile(this.profile, this.baseURI).toString() : null;
			if (!result) return null;
			result += result.indexOf('?') > 0 ? '&' : '?';
			result += `id=${this.id}&path=${encodeURI(this.path)}`;
			return result;
		},
		isPrintVersion() {
			return this.toPrint || this.$store.state.isPrintVersion;
		}
	},
	props: {
		// Путь к данным профиля документа
		path: {
			type: String,
			required: true
		},
		// Параметры передающиеся в запросы документа
		params: {
			type: Object,
			required: true
		},
		// Признак рендеринга документа для печати
		toPrint: {
			type: Boolean,
			required: false,
			default: undefined
		},
		// Контекстное меню
		contextMenu: {
			type: Array,
			default() {
				return [];
			}
		}
	},
	data() {
		const provider = datasets();
		return {
			error: null,
			profile: null,
			menu: {
				show: false,
				x: 0,
				y: 0
			},
			source: {
				provider,
				status: SOURCE_READY,
				dataset: null,
				refreshTimer: null
			}
		};
	},
	watch: {
		path() { this.doRefresh(); },
		params() { this.doRefresh(); },
		error(error) {
			if (error) {
				// eslint-disable-next-line no-console
				console.error(error, this.url ? `Ошибка запроса [${this.url}]` : undefined);
				this.$emit('appendError', error);
			} else
				this.$emit('clearErrors');
		}
	},
	created() {
		// Следим за обновлением документа
		gateway.appendListener('source/changed', this.onChangeSource);
	},
	destroyed() {
		gateway.removeListener('source/changed', this.onChangeSource);
	},
	mounted() {
		this.$on('showContextMenu', this.showContextMenu);
		this.doRefresh();
	}
};
