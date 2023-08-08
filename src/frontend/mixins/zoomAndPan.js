export default {
	data: () => ({
		zoomKey: 'ctrlKey',  // Кнопка для зума
		panKey: 'shiftKey',
		isMove: false, 			 // Признак перемещения схемы
		isShiftSens: false,  // Признак, что пользователь нажал шифт
		cacheViewBox: null,
		moveX: 0,
		moveY: 0,
		zoom: {
			value: 1,   // Текущий зум
			step: 0.1  	// Шаг зума
		}
	}),
	computed: {
		koofScreenX() {
			return this.zoomAndPanElement ? this.viewBox.width / this.zoomAndPanElement.clientWidth : 1;
		},
		// Коэффициент преобразования реальных точек во внутренние по высоте
		koofScreenY() {
			return this.zoomAndPanElement ? this.viewBox.height / this.zoomAndPanElement.clientHeight : 1;
		},
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
		},
		zoomAndPanMouseDown(event) {
			if (!event[this.panKey]) return;
			this.isMove = true;
			this.moveX = event.clientX;
			this.moveY = event.clientY;
		},
		zoomAndPanMouseMove(event) {
			this.isShiftSens = event[this.panKey];
			if (!this.isMove) return;
			this.viewBox.x += (this.moveX - event.clientX) * (this.koofScreenX || 0);
			this.viewBox.y += (this.moveY - event.clientY) * (this.koofScreenY || 0);
			this.moveX = event.clientX;
			this.moveY = event.clientY;
		},
		zoomAndPanMouseUp() {
			this.isMove = false;
		}
	}
};
