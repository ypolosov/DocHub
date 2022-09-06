import datasets from '../../helpers/datasets';
import docs from '@/helpers/docs';
import gateway from '@/idea/gateway';

const SOURCE_PENGING = 'pending';
const SOURCE_READY = 'ready';
const SOURCE_ERROR = 'error';

export default {
	methods: {
		doRefresh() {
			if (this.source.refreshTimer) clearTimeout(this.source.refreshTimer);
			this.source.refreshTimer = setTimeout(() => this.refresh(), 100);
		},
		sourceRefresh() {
			this.source.status = SOURCE_PENGING;
			this.source.dataset = null;
			if (this.profile.source) {
				this.source.provider.getData(this.manifest, Object.assign({'_id': this.document}, this.profile))
					.then((dataset) => {
						this.source.dataset = dataset;
						this.source.status = SOURCE_READY;
					})
					.catch((e) => {
						this.source.error = e;
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
		isTemplate() {
			return this.profile.template;
		},
		profile() {
			return this.manifest?.docs?.[this.document] || {};
		},
		url() {
			const result = this.profile ?
				docs.urlFromProfile(this.profile,
					(this.$store.state.sources.find((item) => item.path === `/docs/${this.document}`) || {}).location
				): '';
			return `${result}?id=${this.document}`;
		}
	},
	props: {
		document: { type: String, default: '' }
	},
	data() {
		const provider = datasets();
		provider.dsResolver = (id) => {
			return {
				subject: Object.assign({'_id': id}, (this.manifest.docs || {})[id]),
				baseURI: (this.$store.state.sources.find((item) => item.path === `/docs/${id}`) || {}).location
			};
		};
		return {
			source: {
				provider,
				status: SOURCE_READY,
				error: null,
				dataset: null,
				refreshTimer: null
			}
		};
	},
	watch: {
		url() { this.doRefresh(); },
		manifest() { 
			this.isTemplate && this.doRefresh(); 
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
