# Диаграммы

Для представления диаграмм используется библиотека [chart.js 3.9.1](https://www.chartjs.org/)
в обёртке [vue-chartjs v4.1.2](https://vue-chartjs.org/)

Большинство настроек диаграмм передаётся в библиотеку без изменений, 
поэтому для глубокой настройки диаграммы необходимо обращаться к документации библиотек соответствующих версий.

## Общий подход для настройки диаграммы

```yaml
  ...
  dochub.charts.examples.common:
    description: Общий подход настройки диаграммы
    author: V.Markin
    # тип диаграммы
    type: chart-radar
    labels:
      - доступность
      - производительность
      - надежность
      - сопровождаемость
      - обслуживаемость
      - безопасность
    # размер диаграммы
    size: 600
    # настройки диаграммы. см. chart.js
    options:
      elements:
        line:
          borderWidth: 7
      scales:
        r:
          min: 0
          max: 150
    # массив датасетов для заполнения диаграмм
    source:
      - label: Система 1
        # если поле заполнено, то применяются настройки представления датасета по-умолчанию,
        # но их можно переопределить. Детализацию по свойствам см. chart.js
        color: rgb(179,181,198)
        # переопределяем цвет точек
        pointBackgroundColor: green
        # данные диаграммы
        data:
          - 65
          - 59
          - 90
          - 81
          - 56
          - 55
      - label: Система 2
        # color не определён, устанавливаем представление датасета вручную
        backgroundColor: rgba(255,99,132,0.2)
        borderColor: rgba(255,99,132,1)
        pointBackgroundColor: rgba(255,99,132,1)
        pointBorderColor: '#fff'
        pointHoverBackgroundColor: '#fff'
        pointHoverBorderColor: rgba(255,99,132,1),
        fill: false,
        data:
          - 28
          - 48
          - 40
          - 19
          - 96
          - 27
  ...
```

![Общий подход настройки диаграммы на примере Радара](@document/dochub.charts.examples.common)


## Радар
```yaml
  ...
  dochub.charts.examples.radar:
    description: Пример использования диаграммы Радар
    author: V.Markin
    type: chart-radar
    labels:
      - доступность
      - производительность
      - надежность
      - сопровождаемость
      - обслуживаемость
      - безопасность
    size: 400
    origin: dochub.charts.examples.radar
    source: ($)
    ...
datasets:
  dochub.charts.examples.radar:
    source: >
      (
        [
            {
                "label": "Система 3",
                "color": "magenta",
                "data": [
                    10,
                    20,
                    30,
                    40,
                    50,
                    60
                ]
            },
            {
                "label": "Система 4",
                "color": "green",
                "data": [
                    95,
                    85,
                    75,
                    65,
                    55,
                    45
                ]
            }
        ]
      )
    ...
```

![Радар](@document/dochub.charts.examples.radar)

## Столбиковая диаграмма
```yaml
  ...
  dochub.charts.examples.bar:
    description: Пример использования Столбиковой диаграммы
    author: V.Markin
    type: chart-bar
    labels:
      - январь
      - февраль
      - март
      - апрель
      - май
      - июнь
      - июль
      - август
      - сентябрь
      - октябрь
      - ноябрь
      - декабрь
    height: 800
    origin: dochub.charts.examples.bar
    source: ($)
  ...
datasets:
  dochub.charts.examples.bar:
    source: >
      (
        [
          {
            "label": "2022",
            "backgroundColor": "lightblue",
            "data": [30, 10, 2, 29, 50, 30, 29, 70, 30, 20, 42, 11]
          },
          {
            "label": "2023",
            "color": "green",
            "data": [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
          }
        ]
      )

...
```

![Столбиковая диаграмма](@document/dochub.charts.examples.bar)

