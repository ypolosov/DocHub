<template>
  <bubble
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
  import { Bubble } from 'vue-chartjs/legacy';

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LinearScale
  } from 'chart.js';
  import chartMixin from '../ChartMixin';


  ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale);

  export default {
    name: 'BubbleChart',
    components: {
      Bubble
    },
    mixins: [chartMixin],
    props: {
      chartId: {
        type: String,
        default: 'bubble-chart'
      }
    },
    methods: {
      dataSetWithDefaultOptions(dataset) {
        return {
          label: dataset.label,
          backgroundColor: dataset.color,
          data: dataset.data
        };
      }
    }
  };
</script>
