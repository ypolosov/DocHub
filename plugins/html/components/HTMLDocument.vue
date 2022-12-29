<template>
  <div>
    {{ profile }}
    <div v-html="content" />
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
      }
    },
    data() {
      return {
        content: ''
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
      }
    }
  };
</script>
