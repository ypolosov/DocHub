# Таблицы (Table)

Документ предназначен для отображеия данных в табличной форме.

## Предопределенный набор данных
```yaml
docs:
  dochub.table.preset: 
    type: table               # Тип документа 
    headers:                  # Заголовки таблицы
      - value: id             # Идентификатор поля для вывода в колонке
        text: Идентификатор   # Заголовок колокнки
        sortable: true        # Производить сортировку по колонке
        align: left           # Форматирование по горизонтали
        width: 20%            # Ширина колонки 
      - value: payload
        text: Значение
        sortable: true
        align: left
    data:                     # Данные для таблицы (массив)
      - id: 1                 # Поде "id" 
        payload: Значение 1   # Значение поля "id"
      - id: 2
        payload: Значение 2
```

Результат:
![Предопределенная таблица](@document/dochub.table.preset)

## Запрос к данным архитектуры

Есть возможность выполнять запросы к данным архитектуры. Например, получить список всех интеграций:

```yaml
docs:
  dochub.table.select: 
    type: table
    headers:
      - value: from
        text: Система 1
        sortable: true
        align: left
        width: 20%
        link: link-from       # Идентификатор поля, в котором хранится ссылка
      - value: to
        text: Система 2
        sortable: true
        align: left
        width: 20%
        link: link-to
      - value: direction
        text: Связь
        sortable: true
        align: center
        width: 5%
      - value: title
        text: Описание
        sortable: true
        align: left
      - value: contract
        text: Контракт
        sortable: true
        align: left
        link: link-contract
    data: >                   # JSONata запрос к архитектуре
      (
        $MANIFEST := $;
        $distinct([components.$spread().(
            $COMPONENT := $;
            $COMPONENT_ID := $keys()[0];
            $.*.links.{
                "from": $COMPONENT.*.title,
                "link-from": "/architect/components/" & $COMPONENT_ID,
                "to": id ? $lookup($MANIFEST.components, id).title : id,
                "link-to": "/architect/components/" & id,
                "contract": contract ? $lookup($MANIFEST.docs, contract).location : contract,
                "link-contract": "/docs/" & contract,
                "title": title,
                "direction": direction
            };
        )])^(from)
      )
```

Результат:
![Предопределенная таблица](@document/dochub.table.select)

## Генерация таблицы на основании источника данных

Табличные документы могут ссылаться на источники данных.

```yaml
docs:
  dochub.table.dataset: 
    type: table
    headers:
      - value: location
        text: Документ
        sortable: true
        align: left
        width: 100%
        link: link
    data: dochub.docs           # Идентификтор источника данных
datasets:                       # Источники данных
  dochub.docs:                  # Возвращает список всех документов
    data: >                     # JSONata запрос к архитектуре
      (
        [docs.$spread().{
          "location": *.location,
          "link": "/docs/" & $keys()[0]
        }[location]^(location)]
      )
```

Результат:
![Предопределенная таблица](@document/dochub.table.dataset)


## Обработка данных

Перед визуализацией таблицы есть возможность подвергнуть данные обработке.

```yaml
docs:
  dochub.table.dataset.post:    # Табличный с портобработкой данных источника
    type: table
    headers:
      - value: location
        text: Документ
        sortable: true
        align: left
        width: 100%
        link: link
    origin: dochub.docs         # Оригинальный источник данных
    data: >                     # Отбирает документы концепции
      (
        $[$substring(location, 0, 17) = "DocHub/Концепция/"]
      )
datasets:                       # Источники данных
  dochub.docs:                  # Возвращает список всех документов
    data: >                     # JSONata запрос к архитектуре
      (
        [docs.$spread().{
          "location": *.location,
          "link": "/docs/" & $keys()[0]
        }[location]^(location)]
      )
```


Результат:
![Предопределенная таблица](@document/dochub.table.dataset.post)


[Далее](/docs/dochub_forms)