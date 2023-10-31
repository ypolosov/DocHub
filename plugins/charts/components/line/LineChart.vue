<template>
  <line-chart-generator
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
  import { Line as LineChartGenerator } from 'vue-chartjs/legacy';

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    CategoryScale,
    PointElement
  } from 'chart.js';
  import chartMixin from '../ChartMixin';

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    CategoryScale,
    PointElement
  );

  export default {
    name: 'LineChart',
    components: {
      LineChartGenerator
    },
    mixins: [chartMixin],
    props: {
      chartId: {
        type: String,
        default: 'line-chart'
      }
    },
    methods: {
      dataSetWithDefaultOptions(dataset) {
        return {
          label: dataset.label,
          borderColor: dataset.color,
          backgroundColor: dataset.color,
          data: dataset.data
        };
      }
    }
  };
</script>
