<template>
  <div>
    <doc
      v-if="!isParamsInvalid" 
      v-bind:path="presentationPath"
      v-bind:params="entityParams" />
    <v-alert v-else type="error" v-bind:value="true" style="white-space: pre-wrap;">
      Сущность: {{ entity }}<br>
      Представление: {{ presentation }}<br>
      {{ isParamsInvalid.name }}:<br>
      {{ isParamsInvalid.error }}
    </v-alert>      
  </div>
</template>

<script>
  import doc from '../Docs/DocHubDoc.vue';
  import ajv from 'ajv';
  const ajv_localize = require('ajv-i18n/localize/ru');

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
      },
      params: {
        type: Object,
        default: undefined
      }
    },
    data() {
      return {
      };
    },
    computed: {
      // Валидируем входящие параметры, если контракт на параметры определен
      isParamsInvalid() {
        const schema = this.presProfile.params;
        if (schema) {
          try {
            const rules = new ajv({ allErrors: true });
            const validator = rules.compile(schema);
            if (validator(this.entityParams)) return false;
            ajv_localize(validator.errors);
            return {
              name: 'Ошибка валидации параметров',
              error: JSON.stringify(validator.errors, null, 4)
            };
          } catch (e) {
            return {
              name: 'Ошибка описания схемы',
              error: e
            };
          }
        } else return false;
      },
      // Получаем профиль представления
      presProfile() {
        return this.manifest?.entities?.[this.entity]?.presentations?.[this.presentation] || {};
      },
      // Формируем параметры для документа
      entityParams() {
        return this.params || (this.$route.params && this.$router.currentRoute.query);
      },
      presentationPath() {
        return `/entities/${this.entity}/presentations/${this.presentation}`;
      }
    }
  };
</script>
