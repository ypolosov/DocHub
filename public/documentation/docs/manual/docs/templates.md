# Шаблоны

Шаблоны предназначены для генерации документов на основании результатов [JSONata](https://jsonata.org/) запросов
с использованием [mustache](https://mustache.github.io/) языка.

## Markdown

Предоставляется возможность динамически создавать документы:
```yaml
  dochub.templates:         # Пример генерации документа по шаблону
    location: DocHub/Руководство/Документы/Шаблоны
    description: Markdown
    type: markdown
    autor: R.Piontik        # Кастомное поле - Автор документа
    approvers:              # Кастомное поле - список согласующих
      - P.Petrov
      - S.Sidorov
      - N.Nikolaev
    source: >               # JSONata запрос для формирования параметров шаблона
      (
        {
          "id": $self._id,              /* Идентификатор документа */
          "autor": $self.autor,         /* Автор документа */
          "approvers": $self.approvers, /* Согласующие */
          "docs": [docs.$spread().{     /* Другие документы автора */
            "id": $keys()[0],
            "title": *.description,
            "autor": *.autor
          }][autor=$self.autor]
        }
      )
    subjects:
      - dochub.front
      - dochub.front.spa
      - dochub.front.spa.blank
      - dochub.front.spa.blank.doc
    template: templates.md  # Шаблон документа
```

Код шаблона:
```
{{=<% %>=}}

Результат:
* Идентификатор документа: **{{id}}**
* Автор: **{{autor}}**
* Согласующие: {{#approvers}}**{{.}}**; {{/approvers}}
* Другие документы автора:
{{#docs}}
  * [{{title}}](/docs/{{id}})
{{/docs}}

<%={{ }}=%>
```

Результат:
* Идентификатор документа: **{{id}}**
* Автор: **{{autor}}**
* Согласующие: {{#approvers}}**{{.}}**; {{/approvers}}
* Другие документы автора:
{{#docs}}
  * [{{title}}](/docs/{{id}})
{{/docs}}

[Далее](/docs/dochub.datasets) 