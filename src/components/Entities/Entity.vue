<template>
  <div>
    Здесь сущность живет!<br>
    entity: {{ entity }}<br>
    presentation: {{ presentation }}<br>
  </div>
</template>

<script>
  export default {
    name: 'Document',
    props: {
      entity: {
        type: String,
        default: undefined
      },
      presentation: {
        type: String,
        default: undefined
      }
    },
    data() {
      return {
      };
    }
  };
</script>
