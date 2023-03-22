<script>
  import errConstants from '@front/constants/errConstants.json';

  export default {
    functional: true,
    render(createElement, context) {
      return createElement('section', { class: 'errorSection' }, [
        createElement('h1', errConstants.LOAD_ERROR),
        createElement('p', {
          domProps: {
            innerHTML: context.data.error
          }
        })
      ]);
    }
  };
</script>

<style scoped>
  .errorSection {
    top: 5%;
    color: #FF0000;
    text-align: center;
    position: relative;
  }

  .errorSection p {
    white-space: pre;
  }
</style>
