<template>
  <div v-bind:style="placeHolderStyle">
    <doc
      v-if="!isParamsInvalid && !refresh" 
      v-bind:path="presentationPath"
      v-bind:params="entityParams"
      v-bind:context-menu="toSwitchPres" />
    <v-alert v-if="isParamsInvalid" type="error" v-bind:value="true" style="white-space: pre-wrap;">
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
  import { uploadDocument } from './EntityUpload';
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
        refresh: false,
        menu: {
          show: false,
          x : 0,
          y : 0
        },
        selectedPres: null,
        minHeight: null
      };
    },
    computed: {
      // Стиль на время перестройки документа
      placeHolderStyle() {
        return this.minHeight ? { 'min-height': `${this.minHeight}px` } : undefined; 
      },
      // Валидируем входящие параметры, если контракт на параметры определен
      isParamsInvalid() {
        return this.isInvalidParamsToPres(this.presProfile.params);
      },
      // Текущая презентация с учетом альтернативного выбора
      currentPres() {
        return this.selectedPres || this.presentation;
      },
      // Все доступные презентации сущности для переключения
      toSwitchPres() {
        const items = this.manifest?.entities?.[this.entity]?.presentations || {};
        const result = [];
        Object.keys(items).map((id) => {
          if (id === this.currentPres) return;
          const schema = items[id].params;
          if (!schema || !this.isInvalidParamsToPres(schema)) 
            result.push({
              id,
              title: items[id].title || id,
              on: () => this.onSelectedPres(id)
            });
        });
        return result;
      },  
      // Получаем профиль представления
      presProfile() {
        return this.manifest?.entities?.[this.entity]?.presentations?.[this.currentPres] || {};
      },
      // Формируем параметры для документа
      entityParams() {
        return this.params || (this.$route.params && this.$router.currentRoute.query);
      },
      presentationPath() {
        return `/entities/${this.entity}/presentations/${this.currentPres}`;
      }
    },
    watch: {
      entityParams() {
        this.selectedPres = null;
        this.refreshPres();
      }
    },
    methods: {
      // Принудительное обновление представления
      refreshPres() {
        this.refresh = true;
        this.minHeight = this.$el.clientHeight;
        this.$nextTick(() => this.refresh = false);
      },
      // Проверка схемы презентации на параметры
      isInvalidParamsToPres(schema) {
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
      // Выбор альтернативной презентации
      onSelectedPres(presentation) {
        const profile = this.manifest?.entities?.[this.entity]?.presentations?.[presentation] || {};
        // Если презентация направлена на выгрузку данных, генерируем их без переключения презентации
        if (profile.type.toLowerCase() === 'upload') {
          const path = `/entities/${this.entity}/presentations/${presentation}`;
          const baseURI = this.$store.state.sources[path][0];
          uploadDocument(profile, baseURI, this.entityParams, this.manifest);
        } else { // Иначе переключаем презентацию
          this.selectedPres = presentation;
          this.refreshPres();
        }
      }
    }
  };
</script>
