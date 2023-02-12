<template>
  <g>
    <rect 
      rx="4"
      v-bind:x="x"
      v-bind:y="y"
      v-bind:width="width"
      v-bind:height="height"
      class="info" />
    <switch>
      <foreignObject
        class="info-text"
        v-bind:x="x + 4"
        v-bind:y="y + 6"
        v-bind:width="width - 4"
        v-bind:height="height - 6">
        <p>{{ text }}</p>
      </foreignObject>
      <text 
        class="info-text"
        v-bind:x="x + 4"
        v-bind:y="y + 4">        
        {{ text }}
      </text>
    </switch>      
  </g>
</template>

<script>
  export default {
    name: 'DHSchemaTrack',
    props: {
      x: {
        type: Number,
        default: 4
      },
      y: {
        type: Number,
        default: 4
      },
      width: {
        type: Number,
        default: 400
      },
      height: {
        type: Number,
        default: 48
      },
      text: {
        type: String,
        default: 'Тут пусто :('
      }
    },
    data() {
      return {
      };
    },  
    computed: {
    },
    methods: {
    }
  };

</script>

<style scoped>

.info {
  fill: rgb(52, 149, 219);;
  stroke:rgb(52, 149, 219);
  opacity: 0.7;
  stroke-linejoin:round;
  stroke-width:2px;
  -webkit-filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7));
  filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7));
  transition: all 0.25s ease-in;
}

.info-text {
  stroke:#fff;
  color:#fff;
  line-height: 20px;
  font-size: 18px;
  font-weight: 600;
  transition: all 0.25s ease-in;
}

</style>
