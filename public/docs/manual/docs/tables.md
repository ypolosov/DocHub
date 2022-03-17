# Таблицы (Table)

Документ предназначен для отображеия данных в табличной форме.

## Предопределенный набор данных
```yaml
docs:
  dochub.table.preset: 
    type: table
    headers:
      - value: id
        text: Идентификатор
        sortable: true
        align: left
        width: 20%
      - value: payload
        text: Значение
        sortable: true
        align: left
    data:
      - id: 1
        payload: Значение 1
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
      - value: to
        text: Система 2
        sortable: true
        align: left
        width: 20%
      - value: direction
        text: Связь
        sortable: true
        align: center
        width: 5%
      - value: title
        text: Описание
        sortable: true
        align: left
    data: > 
      (
        $MANIFEST := $;
        $distinct([components.$spread().(
            $COMPONENT := $;
            $COMPONENT_ID := $keys()[0];
            $.*.links.{
                "from": $COMPONENT.*.title,
                "to": $lookup($MANIFEST.components, $COMPONENT_ID).title,
                "title": title,
                "direction": direction
            };
        )])^(from)
      )
```

Результат:
![Предопределенная таблица](@document/dochub.table.select)


[Далее](/docs/dochub_forms)