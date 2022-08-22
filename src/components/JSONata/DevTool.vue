<template>
  <v-container grid-list-xl fluid style="height:100%">
    <split v-bind:direction="'vertical'">
      <split-area v-bind:size="30" class="area-space">
        <textarea 
          v-model="query" 
          class="area" 
          wrap="off" 
          v-on:keydown.tab.prevent="tabber($event)" />
      </split-area>
      <split-area v-bind:size="70" class="area-space">
        <textarea v-model="result" class="area" readonly style="background-color: #f5f5f5;" wrap="off" />
      </split-area>
    </Split>
  </v-container>
</template>

<script>

  import query from '@/manifest/query';

  export default {
    name: 'JSONataDevTool',
    data() {
      return {
        query: '"Здесь введите JSONata запрос."',
        result: null,
        observer: null
      };
    },
    watch: {
      query(value) {
        this.observer && clearTimeout(this.observer);
        this.observer = setTimeout(() => {
          this.result = JSON.stringify(query.expression(value).evaluate(this.manifest), null, 4);
          this.observer = null;
        }, 500);
      }
    },
    methods: {
      tabber(event) {
        if (event) {
          event.preventDefault();
          let startText = this.query.slice(0, event.target.selectionStart);
          let endText = this.query.slice(event.target.selectionStart);
          this.query = `${startText}\t${endText}`;
          event.target.selectionEnd = event.target.selectionStart + 1;
        }
      }      
    }
  };
</script>

<style scoped>

.area-space {
  overflow: hidden;
}

.area {
  height: 100%;
  width: 100%;
  resize: none;
  padding: 4px;
  overflow: auto;
}

</style>
