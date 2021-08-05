const SCHEMA_QUERY = `
(
    $MANIFEST := $;
    $CONTEXT_ID := '{%CONTEXT_ID%}';
    $CONTEXT := $CONTEXT_ID = 'self' ? {"title": "Собственный"} : $lookup($MANIFEST.contexts, $CONTEXT_ID);
    {
        "title": $CONTEXT.title ? $CONTEXT.title : $CONTEXT_ID,
        "id": $CONTEXT_ID,
        "components": [components.$spread().(
            $NAMESPACE_ID := $split($keys()[0], "@")[0];
            $NAMESPACE := $lookup($MANIFEST.namespaces, $NAMESPACE_ID);
            {
                "order": $NAMESPACE_ID & ":" & $keys()[0],
                "id": $keys()[0],
                "title": $.*.title,
                "entity": $.*.entity,
                "namespace": {
                        "id": $NAMESPACE_ID,
                        "title": $NAMESPACE and $NAMESPACE.title ? $NAMESPACE.title : $NAMESPACE_ID
                },
                "contexts": $distinct($.*.presentations.contexts),
                "requires": [$distinct($.*.presentations.requires).(
                    $COMPONENT := $lookup($MANIFEST.components, $.id);
                    $NAMESPACE_ID := $split($.id, "@")[0];
                    $NAMESPACE := $lookup($MANIFEST.namespaces, $NAMESPACE_ID);
                    {
                        "id": $.id,
                        "title": $COMPONENT.title ? $COMPONENT.title : $.title,
                        "entity": $COMPONENT.entity ? $COMPONENT.entity : "component",
                        "namespace": {
                                "id": $NAMESPACE_ID,
                                "title": $NAMESPACE and $NAMESPACE.title ? $NAMESPACE.title : $NAMESPACE_ID
                        }
                    }
                )],
                "aspects": $.*.aspects.$spread().(
                    $ASPECT := $lookup($MANIFEST.aspects, $);
                    {
                    "id": $,
                    "title": $ASPECT.title ? $ASPECT.title : $
                })
            }
        )][{%CONDITIONS%}]^(order)[]
    }
)
`;

const MENU_QUERY = `
(
    $MANIFEST := $;
    [
        {
            "title": 'Архитектура',
            "route": 'architect',
            "expand": true,
            "icon": 'home'
        },
        {
            "title": "Контексты",
            "route": 'architect/contexts',
            "icon": 'location_searching'
        },
        {
            "title": "Аспекты",
            "route": 'architect/aspects',
            "icon": 'visibility'
        },
        {
            "title": 'Документы',
            "route": 'docs',
            "expand": true,
            "icon": 'description'
        },
        contexts.$spread().{
            "title": $.*.title,
            "route": 'architect/contexts/' & $keys()[0],
            "location": 'architect/contexts/' & $.*.location,
            "icon": $.*.icon ? $.*.icon : ''
        },
        aspects.$spread().{
            "title": $.*.title,
            "route": 'architect/aspects/' & $keys()[0],
            "location": 'architect/aspects/' & $.*.location,
            "icon": $.*.icon ? $.*.icon : ''
        },
        docs.$spread().{
            "title": $.*.description,
            "route": 'docs/' & $keys()[0],
            "location": 'docs/' & $.*.location,
            "icon": $.*.icon ? $.*.icon : ''
        },
        {
            "title": 'Техрадар',
            "route": 'techradar',
            "icon": 'track_changes'
        },
        technologies.sections.$spread().{
            "title": $.*.title,
            "route": 'techradar/' & $keys()[0],
            "location": 'techradar/' & $.*.title
        }
    ]
).{
    "title": title,
    "route": '/' & route,
    "icon": icon,
    "location": location ? location : route
}
`;

const CONTEXTS_QUERY = `
(
    $MANIFEST := $;
    $distinct($lookup(components, '{%COMPONENT%}').*.contexts).(
        $CONTEXT := $lookup($MANIFEST.contexts, $);
        {
            "id": $,
            "title": $CONTEXT.title ? $CONTEXT.title : $
        }
    )
)
`;

const SUMMARY_COMPONENT_QUERY = `
(
    $COMPONENT_ID := '{%COMPONENT%}';
    $MANIFEST := $;
    $lookup(components, $COMPONENT_ID).(
        $COMPONENT := $;
        $ENTYTY := entity;
        $FORM := $MANIFEST.forms[$ENTYTY in entity].fields;
        $FIELDS := $append([
            {
                "title": "Идентификатор",
                "content": $COMPONENT_ID,
                "field": "id",
                "required": true
            },
            {
                "title": "Название",
                "content": title,
                "field": "title",
                "required": true
            }
        ], $FORM.$spread().{
            "title": $.*.title,
            "required": $.*.required,
            "content": $lookup($COMPONENT, $keys()[0]),
            "field": $keys()[0]
        });
    )
)
`;

const COMPONENT_LOCATIONS_QUERY = `
(
    $COMPONENT_ID := '{%COMPONENT%}';
    [$distinct($[$substring(path, 0, $length($COMPONENT_ID) + 13) = '/components/' & $COMPONENT_ID & '/'].location)]
)
`;

const TECHNOLOGIES_QUERY = `
(
    $MANIFEST := $;
    $distinct(components.*.technologies).(
        $TECHKEY := $;
        $TECHNOLOGY := $lookup($MANIFEST.technologies.items, $);
        $TECHNOLOGY := $TECHNOLOGY ? $TECHNOLOGY : 
            $MANIFEST.technologies.items.*.$[$TECHKEY in aliases];
        $TECHNOLOGY := $TECHNOLOGY ? $TECHNOLOGY : {
            "section": "UNKNOWN",
            "title": "Не определено"
        }; 
        $SECTION := $lookup($MANIFEST.technologies.sections, $TECHNOLOGY.section);
        {
            "label": $,
            "key": $,
            "hint": $TECHNOLOGY.title,
            "link": $TECHNOLOGY.link,
            "section" : {
                "key": $TECHNOLOGY.section,
                "title": $SECTION.title ? $SECTION.title : "Не определено"
            }
        }
    )
)
`;

export default {
    // Меню
    menu () {
        return MENU_QUERY;
    },
    // Запрос по контексту
    context(context) {
        return SCHEMA_QUERY
            .replaceAll("{%CONTEXT_ID%}", context)
            .replaceAll("{%CONDITIONS%}", `$CONTEXT_ID in contexts`)
    },
    // Запрос по компоненту
    component(component) {
        return SCHEMA_QUERY
            .replaceAll("{%CONTEXT_ID%}", 'self')
            .replaceAll("{%CONDITIONS%}", `id = '${component}'`)
    },
    // Запрос контекстов в которых встречается компонент
    contextsForComponent(component) {
        return CONTEXTS_QUERY.replaceAll("{%COMPONENT%}", component)
    },
    // Сводка по компоненту
    summaryForComponent(component) {
        return SUMMARY_COMPONENT_QUERY.replaceAll("{%COMPONENT%}", component)
    },
    // Определение размещения манифестов описывающих компонент
    locationsForComponent(component) {
        return COMPONENT_LOCATIONS_QUERY.replaceAll("{%COMPONENT%}", component)
    },
    // Сбор информации об использованых технологиях
    collectTechnologies() {
        return TECHNOLOGIES_QUERY;
    }
}
