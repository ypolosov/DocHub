<template>
  <scatter
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
  import { Scatter } from 'vue-chartjs/legacy';

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    CategoryScale,
    PointElement,
    LinearScale
  } from 'chart.js';
  import chartMixin from '../ChartMixin';

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    CategoryScale,
    PointElement,
    LinearScale
  );

  export default {
    name: 'ScatterChart',
    components: {
      Scatter
    },
    mixins: [chartMixin],
    props: {
      chartId: {
        type: String,
        default: 'scatter-chart'
      }
    },
    methods: {
      dataSetWithDefaultOptions(dataset) {
        return {
          label: dataset.label,
          fill: false,
          borderColor: dataset.color,
          backgroundColor: dataset.color,
          data: dataset.data
        };
      }
    }
  };
</script>
