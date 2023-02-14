<template>
  <g>
    <path 
      v-bind:class="classesArrow"
      v-bind:d="arrows" 
      v-bind:style="{ opacity: track.opacity }"
      v-on:mouseover="onTrackOver"
      v-on:mouseleave="onTrackLeave"
      v-on:mousedown.stop.prevent="onTrackClick" />
    <path
      v-bind:id="id" 
      v-bind:class="classesLine"
      v-bind:d="line" 
      v-bind:style="{ opacity: track.opacity }"
      v-on:mouseover="onTrackOver"
      v-on:mouseleave="onTrackLeave"
      v-on:mousedown.stop.prevent="onTrackClick" />
    <text
      v-if="title"
      v-bind:x="title.point.x"
      v-bind:y="title.point.y"
      v-bind:style="{ opacity: track.opacity }"
      v-bind:transform="`rotate(${title.rotate}, ${title.point.x}, ${title.point.y})`"
      text-anchor="middle"
      v-bind:class="classesTitle"
      v-on:mouseover="onTrackOver"
      v-on:mouseleave="onTrackLeave"
      v-on:mousedown.stop.prevent="onTrackClick">
      {{ title.text }}
    </text>
  </g>
</template>

<script>
  import rounding from './rounding';

  const ARROW_WIDTH     = 2;
  const ARROW_HEIGHT    = 5;
  const TRACK_SMOOTHING = 4;

  export default {
    name: 'DHSchemaTrack',
    props: {
      track: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
      };
    },  
    computed: {
      // Определяем как и где будет выводиться надпись на линке
      title() {
        if (!this.track.link.title || (this.track.length < 2))
          return null;
        const segments = [];
        let oldX = this.track.path[0].x;
        let oldY = this.track.path[0].y;
        let segment = 0;
        let maxSegment = {
          size: 0,
          index: 0,
          point: this.track.path[0]
        };
        segments.push(maxSegment.point);
        const len = this.track.path.length;
        for (let i = 1; i < len; i++) {
          const point = this.track.path[i];
          const a1 = Math.abs(this.track.path[i - 1].x - point.x);
          const a2 = Math.abs(this.track.path[i - 1].y - point.y);
          segment += i ? Math.round(Math.sqrt(a1 * a1 + a2 * a2)) : 0;
          if (((oldX !== point.x) && (oldY !== point.y)) || (i+1 === len)) {
            if (maxSegment.size < segment) {
              maxSegment.point = point;
              maxSegment.size = segment;
              maxSegment.index = segments.length;
            }
            segments.push(point);
            segment = 0;
            oldX = point.x;
            oldY = point.y;
          }
        }

        const start = segments[maxSegment.index - 1];
        const end = segments[maxSegment.index] || {x: oldX, y: oldY};

        const result = {
          text: this.track.link.title,
          point : {
            x: 0,
            y: 0
          },
          rotate: 0
        };

        if (start.x !== end.x) {
          result.point.x = start.x - (start.x - end.x) * 0.5;
          result.point.y = start.y - 4;
        } else  {
          result.point.y = start.y - (start.y - end.y) * 0.5;
          result.point.x = start.x + 4;
          result.rotate = 90;
        }

        return result;
      },
      id() {
        return this.track.id;
      },
      startArrow() {
        return ('-' + this.track.link.style).slice(-1);
      },
      endArrow() {
        return (this.track.link.style + '-').slice(0, 1);
      },
      // Стиль надписи
      classesTitle() {
        const result = ['track-title'];
        // Определяем нужно ли подсвечивать путь
        if (this.track.highlight) result.push('title-highlight');
        return result.join(' ');
      },
      // Стиль стрелок
      classesArrow() {
        return this.makeClass(true);
      },
      // Стиль линии 
      classesLine() {
        return this.makeClass();
      },
      // Стрелки
      arrows() {
        let result = '';
        const track = this.track.path;
        // Расставляем стрелки завершения пути
        [
          { curr : track[track.length - 1], prev: track[track.length - 2], after: true, arrow: this.endArrow},
          { curr : track[0], prev: track[1], arrow: this.startArrow}
        ].map((pice) =>{
          let arrow = '';
          if ((pice.prev.x === pice.curr.x) && (pice.prev.y < pice.curr.y))
            arrow = this.makeArrow(pice.curr.x, pice.curr.y, pice.arrow, 'down');
          else if ((pice.prev.x === pice.curr.x) && (pice.prev.y > pice.curr.y))
            arrow = this.makeArrow(pice.curr.x, pice.curr.y, pice.arrow, 'up');
          else if ((pice.prev.x < pice.curr.x) && (pice.prev.y === pice.curr.y))
            arrow = this.makeArrow(pice.curr.x, pice.curr.y, pice.arrow, 'left');
          else if ((pice.prev.x > pice.curr.x) && (pice.prev.y === pice.curr.y))
            arrow = this.makeArrow(pice.curr.x, pice.curr.y, pice.arrow, 'right');
          
          if (pice.after)
            result += ` ${arrow}`;
          else
            result = `${arrow} ${result}`;
        });

        return result;
      },

      // Путь 
      line() {
        const track = this.track.path;
        if (track.length < 2) return '';

        let result = `M${track[0].x} ${track[0].y}`;

        const len = this.track.path.length;
        let oldX = track[0].x;
        let oldY = track[0].y;
        for (let i = 1; i < len; i++) {
          if ((oldX !== track[i].x) && (oldY !== track[i].y)) {
            result += ` L ${track[i-1].x} ${track[i-1].y}`;
            result += ` L ${track[i].x} ${track[i].y}`;
            oldX = track[i].x;
            oldY = track[i].y;
          }
        }
        result += ` L ${track[len - 1].x} ${track[len - 1].y}`;

        result = rounding(result, TRACK_SMOOTHING); // Сглаживаем

        return result;
      }
    },
    methods: {
      // 
      onTrackClick() {
        this.$emit('track-click', this.track);
      },
      // Прокидываем события в диаграмму
      onTrackOver() {
        this.$emit('track-over', this.track);
      },
      onTrackLeave() {
        this.$emit('track-leave', this.track);
      },
      // Определяет стиль по совокупности признаков
      makeClass(isArrow) {
        const result = ['track'];
        // Определяем нужно ли подсвечивать путь
        if (this.track.highlight) result.push('track-highlight');
        // Анимируем если нужно
        if (!isArrow && this.track.animate) {
          const animation = this.makeAnimation();
          animation && result.push(animation);
        }
        return result.join(' ');
      },
      // Определяет классы анимации
      makeAnimation() {
        if ((this.startArrow === '>') && (this.endArrow === '<')) return 'track-animation-pull-push';
        if (this.startArrow === '>') return 'track-animation-pull';
        else if (this.endArrow === '<') return 'track-animation-push';
        return null;
      },
      // Генерирует path стрелки
      makeArrow(x, y, style, direction) {
        switch(style) {
          case '>':
          case '<':
            switch (direction) {
              case 'up':
                return `M ${x - ARROW_WIDTH} ${y + ARROW_HEIGHT} L ${x} ${y} L ${x + ARROW_WIDTH} ${y + ARROW_HEIGHT}`;
              case 'down':
                return `M ${x - ARROW_WIDTH} ${y - ARROW_HEIGHT} L ${x} ${y} L ${x + ARROW_WIDTH} ${y - ARROW_HEIGHT}`;
              case 'left':
                return `M ${x - ARROW_HEIGHT} ${y - ARROW_WIDTH} L ${x} ${y} L ${x - ARROW_HEIGHT} ${y + ARROW_WIDTH}`;
              case 'right':
                return `M ${x + ARROW_HEIGHT} ${y - ARROW_WIDTH} L ${x} ${y} L ${x + ARROW_HEIGHT} ${y + ARROW_WIDTH}`;
              default:
                throw `Неизвестное направление стрелки ${direction} для связи ${this.track.id}`;
            }
          case '-': return '';
          default:
            throw `Неизвестный тип стрелки ${style} для связи ${this.track.id}`;
        }
      }
    }
  };

</script>

<style scoped>

* {
  transition: all 0.15s ease-in;
}

.track {
  cursor: crosshair;
  stroke: rgb(52, 149, 219);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
  fill: none;
}

.track-title {
  stroke: rgba(0,0,0,.6);
  stroke-width: 0px;
  font-size: 12px;
}

.track-animation-pull {
  stroke-dasharray: 10;
  stroke-dashoffset: 0;
  animation: pull 1s linear;
  animation-iteration-count: infinite;
}

.track-animation-push {
  stroke-dasharray: 10;
  stroke-dashoffset: 80;
  animation: push 1s linear;
  animation-iteration-count: infinite;
}

.track-animation-pull-push {
  stroke-dasharray: 10;
  stroke-dashoffset: 80;
  animation: push 1s linear;
  animation-direction: alternate-reverse;
  animation-iteration-count: infinite;
}


@keyframes pull {
  to {
    stroke-dashoffset: 80;
  }
}

@keyframes push {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes pull-push {
  to {
    stroke-dashoffset: 0;
  }
}


/* Стили треков */
.track-highlight {
  stroke: #ff0000;
  z-index: 10000;
}

.title-highlight {
  z-index: 10000;
}

</style>
