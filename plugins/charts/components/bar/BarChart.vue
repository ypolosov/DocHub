<template>
  <bar
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
  import { Bar } from 'vue-chartjs/legacy';

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
  } from 'chart.js';
  import chartMixin from '../ChartMixin';

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

  export default {
    name: 'BarChart',
    components: {
      Bar
    },
    mixins: [chartMixin],
    props: {
      chartId: {
        type: String,
        default: 'bar-chart'
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
