export default {
	computed: {
		manifest() {
			return this.$store.state.manifest || {};
		}
	}
};
