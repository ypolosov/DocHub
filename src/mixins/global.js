import { MANIFEST_MODES } from '@/manifest/enums/manifest-modes.enum';

export default {
	computed: {
		manifest() {
			return this.$store.state.manifest[MANIFEST_MODES.AS_IS] || {};
		}
	}
};
