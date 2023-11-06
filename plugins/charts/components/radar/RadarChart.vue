<template>
  <radar
    v-bind:chart-options="chartOptions"
    v-bind:chart-data="chartData"
    v-bind:chart-id="chartId"
    v-bind:dataset-id-key="datasetIdKey"
    v-bind:plugins="plugins"
    v-bind:css-classes="cssClasses"
    v-bind:styles="styles"
    v-bind:width="width"
    v-bind:height="height" />
</template>

<script>
  import { Radar } from 'vue-chartjs/legacy';

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    RadialLinearScale,
    Filler
  } from 'chart.js';
  import Color from 'chartjs-color';
  import chartMixin from '../ChartMixin';

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    PointElement,
    RadialLinearScale,
    LineElement,
    Filler
  );

  export default {
    name: 'RadarChart',
    components: {
      Radar
    },
    mixins: [chartMixin],
    props: {
      chartId: {
        type: String,
        default: 'radar-chart'
      }
    },
    methods: {
      dataSetWithDefaultOptions(dataset) {
        const color = new Color(dataset.color);
        return {
          label: dataset.label,
          backgroundColor: color.clone().alpha(0.2).rgbString(),
          borderColor: dataset.color,
          pointBackgroundColor: dataset.color,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: dataset.color,
          data: dataset.data
        };
      }
    }
  };
</script>
