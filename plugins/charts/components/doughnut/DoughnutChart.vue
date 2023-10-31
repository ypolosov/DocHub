<template>
  <doughnut
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
  import { Doughnut } from 'vue-chartjs/legacy';

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale
  } from 'chart.js';
  import chartMixin from '../ChartMixin';

  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

  export default {
    name: 'DoughnutChart',
    components: {
      Doughnut
    },
    mixins: [chartMixin],
    props: {
      chartId: {
        type: String,
        default: 'doughnut-chart'
      }
    },
    methods: {
      dataSetWithDefaultOptions(dataset) {
        return {
          backgroundColor: dataset.color,
          data: dataset.data
        };
      }
    }
  };
</script>
