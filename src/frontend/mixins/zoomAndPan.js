export default {
	data: () => ({
		zoomKey: 'ctrlKey',  // Кнопка для зума
		cacheViewBox: null,
		zoom: {
			value: 1,   // Текущий зум
			step: 0.1  	// Шаг зума
		}
	}),
	computed: {
		viewBox() {
			if (!this.zoomAndPanElement) {
				return {
					x: 0,
					y : 0,
					width : 0,
					height : 0
				};
			} else
				return this.cacheViewBox ?
					this.cacheViewBox
					// eslint-disable-next-line vue/no-side-effects-in-computed-properties
					: this.cacheViewBox = this.zoomAndPanElement.viewBox.baseVal; 
		},
		zoomAndPanElement() {
			return this.$refs.zoomAndPan.$el;
		}
	},
	methods: {
		doZoom(value, x, y) {
			const kX = x / (this.zoomAndPanElement.clientWidth || x);
			const kY = y / (this.zoomAndPanElement.clientHeight || y);
			let resizeWidth = value * this.viewBox.width;
			let resizeHeight = value * this.viewBox.height;
			this.viewBox.x -= resizeWidth * kX;
			this.viewBox.width += resizeWidth;
			this.viewBox.y -= resizeHeight * kY;
			this.viewBox.height += resizeHeight;
			this.cacheViewBox = null;
		},
		zoomAndPanWheelHandler(event) {
			if (!event[this.zoomKey]) return;
			let e = window.event || event;
			switch (Math.max(-1, Math.min(1, (e.deltaY || -e.detail)))) {
				case 1:
					this.doZoom(this.zoom.step, event.offsetX, event.offsetY);
					break;
				case -1:
					this.doZoom(-this.zoom.step, event.offsetX, event.offsetY);
					break;
			}
			event.stopPropagation();
		}
	}
};
