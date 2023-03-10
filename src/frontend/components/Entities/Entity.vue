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
  import ajv from 'ajv';
  const ajv_localize = require('ajv-i18n/localize/ru');

  import doc from '@front/components/Docs/DocHubDoc.vue';
  import query from '@front/manifest/query';
  
  import { uploadDocument } from './EntityUpload';

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
        profile: null,
        refresher: null,
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
        return this.isInvalidParamsToPres(this.presProfile?.params);
      },
      // Текущая презентация с учетом альтернативного выбора
      currentPres() {
        return this.selectedPres || this.presentation;
      },
      // Все доступные презентации сущности для переключения
      toSwitchPres() {
        const items = this.profile?.presentations || {};
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
        return this.profile?.presentations?.[this.currentPres] || {};
      },
      // Формируем параметры для документа
      entityParams() {
        return this.params || (this.$route.params && this.$router.currentRoute.query);
      },
      presentationPath() {
        return `${this.entityPath}/presentations/${this.currentPres}`;
      },
      entityPath() {
        return `/entities/${this.entity}`;
      }
    },
    watch: {
      entityParams() {
        this.reloadProfile();
      },
      presentationPath() {
        this.reloadProfile();
      }
    },
    mounted() {
      this.reloadProfile();
    },
    methods: {
      makeDataLakeID(path) {
        return `("${path.slice(1).split('/').join('"."')}")`;
      },
      // Перезагружает профиль сущности
      reloadProfile() {
        if (this.refresher) clearTimeout(this.refresher);
        this.refresher = setTimeout(() =>{
          this.selectedPres = null;
          const dateLakeId = this.makeDataLakeID(this.entityPath);
          query.expression(dateLakeId).evaluate()
            .then((data) => {
              // Проверяем, что результат запроса не устарел
              if (dateLakeId === this.makeDataLakeID(this.entityPath)) {
                this.profile = data;
              }
            })
            .catch((e) => this.error = e)
            .finally(() => this.refresher = null);
        } ,100);
      },
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
        const presProfile = this.profile?.presentations?.[presentation] || {};
        // Если презентация направлена на выгрузку данных, генерируем их без переключения презентации
        if (presProfile.type.toLowerCase() === 'upload') {
          const path = `/entities/${this.entity}/presentations/${presentation}`;
          const baseURI = this.$store.state.sources[path][0];
          uploadDocument(presProfile, baseURI, this.entityParams, this.manifest);
        } else { // Иначе переключаем презентацию
          this.selectedPres = presentation;
          this.refreshPres();
        }
      }
    }
  };
</script>
