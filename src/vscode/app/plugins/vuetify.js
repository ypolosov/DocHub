import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

export const vuetify = new Vuetify({
	icons: {
		iconfont: 'mdi'
	},
	theme: {
		dark: false,
		options: {
			customProperties: true
		},
		themes: {
			light: {
				// primary: '#E30611',
				// accent: '#AD0B17', // --color-primary-active
				// error: '#F95721', // --color-normal-orange
				// success: '#03A17B', // --color-success
				// anchor: '#007CFF', // --color-link
				// link: '#007CFF',
			}
		}
	}
});
