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

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

  let defaultOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  function dataSetWithDefaultOptions(dataset) {
    return {
      label: dataset.label,
      backgroundColor: dataset.color,
      data: dataset.data
    };
  }


  export default {
    name: 'BarChart',
    components: {
      Bar
    },
    props: {
      chartId: {
        type: String,
        default: 'bar-chart'
      },
      profile: {
        type: Object,
        required: true
      },
      pullData: {
        type: Function,
        required: true
      },
      datasetIdKey: {
        type: String,
        default: 'label'
      },
      cssClasses: {
        default: '',
        type: String
      },
      styles: {
        type: Object,
        default: () => {}
      },
      plugins: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        refresher: null,
        width: this.profile?.width || 400,
        height: this.profile?.height || 400,
        chartData: {
          labels: [],
          datasets: []
        },
        chartOptions: { ...defaultOptions, ...this.profile?.options }
      };
    },
    watch: {
      profile() {
        this.onRefresh();
      }
    },
    mounted() {
      this.onRefresh();
    },
    methods: {
      onRefresh() {
        if (this.refresher) clearTimeout(this.refresher);
        this.refresher = setTimeout(this.doRefresh, 50);
      },
      doRefresh() {
        if (this.profile) {
          this.chartData.labels = this.profile.labels;
          this.chartOptions = { ...defaultOptions, ...this.profile?.options };

          this.pullData().then((result) => {
            try {
              this.chartData.datasets = result.map((dataset) =>
                dataset.color ? { ...dataSetWithDefaultOptions(dataset), ...dataset } : dataset
              );
            } catch (e) {
              this.error = e;
            }
          }).catch((e) => this.error = e);

        }
      }
    }
  };
</script>
