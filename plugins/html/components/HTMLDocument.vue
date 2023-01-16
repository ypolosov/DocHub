<template>
  <div class="space">
    <h1>Пример простого плагина</h1>
    <h2>Параметры передаваемые в плагин:</h2>
    <table>
      <tr>
        <td class="label">Путь к объекту в данных:</td>
        <td>{{ path }}</td>
      </tr>
      <tr>
        <td>Профиль документа:</td>
        <td>{{ profile }}</td>
      </tr>
      <tr>
        <td>Переданные параметры:</td>
        <td>{{ params }}</td>
      </tr>
    </table>
    <h2>Пример результата запроса к данным архитектуры</h2>
    В кодовой базе:
    <table>
      <tr>
        <td class="label">Документов</td>
        <td>{{ dataFromLake.docs }}шт</td>
      </tr>
      <tr>
        <td>Компонентов:</td>
        <td>{{ dataFromLake.components }}шт</td>
      </tr>
      <tr>
        <td>Контекстов:</td>
        <td>{{ dataFromLake.contexts }}шт</td>
      </tr>
    </table>
    <h2>Результат рендеринга файла с HTML кодом:</h2>
    <div class="html-example" v-html="content" />
  </div>
</template>

<script>

  export default {
    name: 'HTMLDocument',
    props: {
      // Требуем обязательно передавать профайл документа 
      profile: {
        type: Object,
        required: true
      },
      // Требуем обязательно передавать функцию получения контента
      getContent: {
        type: Function,
        required: true
      },
      // Требуем обязательно передавать функцию доступа к Data Lake
      pullData: {
        type: Function,
        required: true
      },
      // Требуем обязательно сообщать путь к объекту описывающему документ в коде
      path: {
        type: String,
        required: true
      },
      // Запрашиваем параметры рендеринга
      params: {
        type: Object,
        default: null
      }
    },
    data() {
      return {
        // Здесь будет храниться контент из полученного HTML файла 
        content: '',
        // Здесь будет храниться результат запроса к данным архитектуры
        dataFromLake: {}
      };
    },

    watch: {
      profile() {
        // При изменении переметров, перезагружаем контент документа с их учетом
        this.refresh();
      }
    },
    mounted() {
      // При монтировании компонента в DOM загружаем контент документа
      this.refresh();
    },
    methods: {
      // Функция обновления контента документа с учетом параметров содержащихся в "this.profile"
      refresh() {
        if (this.profile) {
          // В архитектурной кодовой базе указываются относительные пути к файлам при описании документа.
          // Для успешного получения контента этих файлов необходимо использовать функцию getContent.
          // Рекумендуется также использовать эту функцию для доступа к любым иным ресурсам по http/https. 
          this.getContent(this.profile.source)
            // Если все хорошо, рендерим HTML "как есть"
            .then((response) => {
              this.content = response.data;
            })
            // Если что-то пошло не так, генерируем HTML с ошибкой
            .catch((error) => {
              this.content = `<div style="color:#fff; background-color: #f00">Ошибка выполнения запроса [${this.profile.source}]: <br> ${error}</div>`;
            });
        } else this.content = '';

        // Выполняем запрос к данным архитектуры
        this.pullData(`
          {
            "docs": $count(docs.*),
            "components": $count(components.*),
            "contexts": $count(contexts.*)
          }
        `).then((result) => this.dataFromLake = result);
      }
    }
  };
</script>

<style scoped>
h2 {
  margin-top: 24px;
}
td {
  padding: 6px;;
}
.space {
  padding: 12px;
}
.label {
  width: 20%;
}
.html-example {
  padding: 12px;
  margin: 12px;
  border: solid 1px #ccc;
}
</style>
