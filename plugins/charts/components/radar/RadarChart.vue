<template>
  <radar
    v-bind:chart-options="chartOptions"
    v-bind:chart-data="chartData"
    v-bind:chart-id="chartId"
    v-bind:dataset-id-key="datasetIdKey"
    v-bind:plugins="plugins"
    v-bind:css-classes="cssClasses"
    v-bind:styles="styles"
    v-bind:width="size"
    v-bind:height="size" />
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

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    PointElement,
    RadialLinearScale,
    LineElement,
    Filler
  );

  let defaultOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  function dataSetWithDefaultOptions(dataset) {
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

  export default {
    name: 'RadarChart',
    components: {
      Radar
    },
    props: {
      chartId: {
        type: String,
        default: 'radar-chart'
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
        size: this.profile?.size || 400,
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
