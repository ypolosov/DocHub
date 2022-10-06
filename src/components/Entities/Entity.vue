<template>
  <div>
    Здесь сущность живет!<br>
    entity: {{ entity }}<br>
    presentation: {{ presentation }}<br>
    <doc 
      v-bind:profile-resolver="profileResolver" 
      v-bind:url-resolver="urlResolver" />
    />
  </div>
</template>

<script>
  import docs from '@/helpers/docs';
  import doc from '../Docs/DocHubDoc.vue';

  export default {
    name: 'Entity',
    components: {
      doc
    },
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
    },
    computed: {
      presProfile() {
        return this.manifest?.entities?.[this.entity]?.presentations?.[this.presentation] || {};
      }
    },
    methods:{
      profileResolver() {
        debugger;
        return this.presProfile;
      },
      urlResolver() {
        debugger;
        const result = this.presProfile ?
          docs.urlFromProfile(this.presProfile,
                              (this.$store.state.sources.find((item) => item.path === `/entities/${this.entity}`) || {}).location
          ): '';
        return `${result}?id=${this.entity}`;
      }
    }
  };
</script>
