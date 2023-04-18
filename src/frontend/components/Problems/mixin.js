export default {
	computed: {
		problems() {
			return this.$store.state.problems || [];
		}
	}
};
