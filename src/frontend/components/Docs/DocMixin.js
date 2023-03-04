import datasets from '@front/helpers/datasets';
import gateway from '@idea/gateway';
import docs from '@front/helpers/docs';
import query from '@front/manifest/query';

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
		doRefresh() {
			this.error = null;
			if (this.source.refreshTimer) clearTimeout(this.source.refreshTimer);
			this.source.refreshTimer = setTimeout(() => this.refresh(), 100);
		},
		refresh() {
			this.sourceRefresh();
		},
		sourceRefresh() {
			this.source.status = SOURCE_PENGING;
			this.source.dataset = null;
			if (this.isTemplate && this.profile?.source) {
				this.source.provider.releaseData(this.path, this.params)
					.then((dataset) => {
						this.source.dataset = dataset;
						this.source.status = SOURCE_READY;
					})
					.catch((e) => {
						this.error = e;
						this.source.status = SOURCE_ERROR;
					});
			} else this.source.dataset = {};
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
	asyncComputed: {
		async profile() {
			const id = `"${this.path.slice(1).split('/').join('"."')}"`;
			console.info('>>>>>>>', id);
			return await query.expression(id).evaluate();
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
			return this.$store.state.sources[this.path][0];
		},
		url() {
			let result = this.profile ? docs.urlFromProfile(this.profile, this.baseURI).toString() : '';
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
		url() { this.doRefresh(); },
		params() { this.doRefresh(); },
		/*
		manifest() { 
			this.isTemplate && this.doRefresh(); 
		},
		*/
		error(error) {
			// eslint-disable-next-line no-console
			console.error(error, this.url ? `Ошибка запроса [${this.url}]` : undefined);
			if (error)
				this.$emit('appendError', error);
			else
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
