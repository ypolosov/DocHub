# Интерфейсы ядра

Ядро DocHub предоставляет два интерфейса для взаимодействия плагинов с ним:

## 1. Глобальная переменная DocHub

window.DocHub - глобальная переменная содержащая коллекцию менеджеров, управляющих базовыми сущностями DocHub.

### DocHub.documents.register(type: String, component: Component)

Регистрирует новый тип документов. Принимает параметры:

* **type** - Название типа документа;
* **component** - VUE2 компонент, который будет использован для рендеринга документов указанного типа.

Пример использования:

```JavaScript
import doc from './components/HTMLDocument.vue';

DocHub.documents.register('html', doc);
```

## 2. Параметры компонентов documents

### profile 

В параметре передается объект, содержащий данные участка архитектурного кода, конфигурирующего представление 
документа. Например, код:

```yaml
docs:
  ...
  dochub.plugins.example:
    location: DocHub/Руководство/Плагины/Пример
    type: html
    source: examples/example.html    
```

вызовет компонент плагина, зарегистрированного для типа документа "html", которому будет передана 
в параметре "manifest" структура:

```json
{
    "location": "DocHub/Руководство/Плагины/Пример",
    "type": "html",
    "source": "examples/example.html"
}
```

Пример использования:
```JavaScript
props: {
    ...
    profile: {
        type: Object,
        required: true
    },
    ...
}
```

### getContent

В архитектурной кодовой базе указываются относительные пути к файлам при описании документа.
Для успешного получения контента этих файлов необходимо использовать функцию getContent передающуюся 
в качестве параметра компонента. 

Функция принимает в качестве параметра URL и возвращает Promise.

Рекомендуется также использовать эту функцию для доступа к любым иным ресурсам по http/https. 

Пример использования:
```JavaScript
props: {
    ...
    getContent: {
        type: Function,
        required: true
    },
    profile: {
        type: Object,
        required: true
    }
    ...
},
methods: {
    ...
    refresh() {
        ...
        this.getContent(this.profile.source)
        .then((response) => {
            console.info(`Успешный успех!`, response.data);
        })
        .catch((error) => {
            console.error(`Ошибка выполнения запроса [${this.profile.source}]`, error);
        });
        ...
    }
    ...
}
```
