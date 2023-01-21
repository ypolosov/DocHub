import datasets from '../../helpers/datasets';
import gateway from '@/idea/gateway';
import docs from '@/helpers/docs';

const SOURCE_PENGING = 'pending';
const SOURCE_READY = 'ready';
const SOURCE_ERROR = 'error';

export default {
	components: {
		Box: {
			template: '<div><v-alert v-for="error in errors" v-bind:key="error.key" type="error" style="white-space: pre-wrap;">{{error.message}}</v-alert><slot v-if="!errors.length"></slot></div>',
			created: function() {
				this.$parent.$on('appendError', (error) => this.errors.push(
					{
						key: Date.now(),
						message: (error?.message || error).slice(0, 1024).toString()
					}
				));
				this.$parent.$on('clearErrors', () => this.errors = []);
			},
			data() {
				return {errors: []};
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
			if (this.isTemplate && this.profile.source) {
				this.source.provider.getData(
					this.manifest,
					Object.assign({'_id': this.id}, this.profile),
					this.params
				)
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
		}
	},
	computed: {
		id() {
			return this.path.split('/').pop();
		},
		isTemplate() {
			return this.profile.template;
		},
		profile() {
			const nodes = this.path.split('/');
			let head = this.manifest;
			for (let i = 1; head && i < nodes.length; i++) {
				head = head[nodes[i]];
			}
			return head;
		},
		url() {
			const baseURI = this.$store.state.sources[this.path][0];
			let result = this.profile ? docs.urlFromProfile(this.profile, baseURI).toString() : '';
			result += result.indexOf('?') > 0 ? '&' : '?';
			result += `id=${this.id}&path=${encodeURI(this.path)}`;
			return result;
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
		}
	},
	data() {
		const provider = datasets();
		provider.dsResolver = (id) => {
			return {
				subject: Object.assign({'_id': id}, (this.manifest.datasets || {})[id])
			}; 
		};
		return {
			error: null,
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
		manifest() { 
			this.isTemplate && this.doRefresh(); 
		},
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
		this.doRefresh();
	}
};
