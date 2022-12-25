
export default {
	props: {
		profile: {
			type: Object,
			required: true,
			validator(value) {
				return !!value.source;
			}
		},
		// Возвращает контент по относительному URL
		getContent: {
			type: Function,
			required: true
		} 
	}
};
