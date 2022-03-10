
const SCHEMA_CONTEXT = `
(
    $MANIFEST := $;
    $CONTEXT_ID := '{%CONTEXT_ID%}';
    $CONTEXT := $CONTEXT_ID = 'self' ? {"title": "Собственный"} : $lookup($MANIFEST.contexts, $CONTEXT_ID);
    $ARRLEFT := function($ARR ,$COUNT) {
        $map($ARR, function($v, $i) {
            $i < $COUNT ? $v : undefined
        })
    };
    $MKNS := function($IDS) {(
        $map($IDS, function($v, $i) {(
            $ID := $join($ARRLEFT($IDS, $i + 1), ".");
            $NAMESPACE := $lookup($MANIFEST.namespaces, $ID);
            {
                "id": $ID,
                "title": $NAMESPACE and $NAMESPACE.title ? $NAMESPACE.title : $ID,
                "type": $NAMESPACE.type
            }
        )})
    )};
    {
        "title": $CONTEXT.title ? $CONTEXT.title : $CONTEXT_ID,
        "id": $CONTEXT_ID,
        "uml": $CONTEXT.uml,
        "extra": $CONTEXT."extra-links",
        "components": [$CONTEXT.components.(
            $COMPONENT_ID := $;
            $COMPONENT := $lookup($MANIFEST.components, $COMPONENT_ID);
            $NAMESPACES_IDS := $split($, ".");
            $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
            });
            {
                "order": $NAMESPACE_ID & ":" & $COMPONENT_ID,
                "id": $COMPONENT_ID,
                "title": $COMPONENT.title,
                "entity": $COMPONENT.entity ? $COMPONENT.entity : 'component',
                "type": $COMPONENT.type,
                "namespaces":[$MKNS($NAMESPACES_IDS)],
                "is_context": $lookup($MANIFEST.contexts, $COMPONENT_ID) ? true : false,
                "links": [$distinct($COMPONENT.links).(
                    $COMPONENT := $lookup($MANIFEST.components, $.id);
                    $NAMESPACES_IDS := $split($.id, ".");
                    $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                        $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                    });
                    $CONTRACT := $lookup($MANIFEST.docs, $.contract);
                    {
                        "id": $.id,
                        "title": $COMPONENT.title ? $COMPONENT.title : $.id,
                        "direction": $.direction ? $.direction : '--',
                        "link_title": $.title,
                        "entity": $COMPONENT.entity ? $COMPONENT.entity : "component",
                        "namespaces":[$MKNS($NAMESPACES_IDS)],
                        "contract": $CONTRACT ? {
                            "id": $.contract,
                            "location": $CONTRACT.location
                        } : undefined
                    }
                )],
                "aspects": [$COMPONENT.aspects.$spread().(
                    $ASPECT := $lookup($MANIFEST.aspects, $);
                    {
                    "id": $,
                    "title": $ASPECT.title ? $ASPECT.title : $
                })]
            }
        )]^(order)[]
    }
)
`;

/* до умного сбора контекстов
const SCHEMA_CONTEXT = `
(
    $MANIFEST := $;
    $CONTEXT_ID := '{%CONTEXT_ID%}';
    $CONTEXT := $CONTEXT_ID = 'self' ? {"title": "Собственный"} : $lookup($MANIFEST.contexts, $CONTEXT_ID);
    $ARRLEFT := function($ARR ,$COUNT) {
        $map($ARR, function($v, $i) {
            $i < $COUNT ? $v : undefined
        })
    };
    $MKNS := function($IDS) {(
        $map($IDS, function($v, $i) {(
            $ID := $join($ARRLEFT($IDS, $i + 1), ".");
            $NAMESPACE := $lookup($MANIFEST.namespaces, $ID);
            {
                "id": $ID,
                "title": $NAMESPACE and $NAMESPACE.title ? $NAMESPACE.title : $ID,
                "type": $NAMESPACE.type
            }
        )})
    )};
    {
        "title": $CONTEXT.title ? $CONTEXT.title : $CONTEXT_ID,
        "id": $CONTEXT_ID,
        "uml": $CONTEXT.uml,
        "extra": $CONTEXT."extra-links",
        "components": [$CONTEXT.components.(
            $COMPONENT_ID := $;
            $COMPONENT := $lookup($MANIFEST.components, $COMPONENT_ID);
            $NAMESPACES_IDS := $split($, ".");
            $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
            });
            {
                "order": $NAMESPACE_ID & ":" & $COMPONENT_ID,
                "id": $COMPONENT_ID,
                "title": $COMPONENT.title,
                "entity": $COMPONENT.entity ? $COMPONENT.entity : 'component',
                "type": $COMPONENT.type,
                "namespaces":[$MKNS($NAMESPACES_IDS)],
                "contexts": $distinct(
                    $MANIFEST.contexts.$spread()[$COMPONENT_ID in *.components].$keys()[0]
                ),
                "links": [$distinct($COMPONENT.links).(
                    $COMPONENT := $lookup($MANIFEST.components, $.id);
                    $NAMESPACES_IDS := $split($.id, ".");
                    $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                        $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                    });
                    $CONTRACT := $lookup($MANIFEST.docs, $.contract);
                    {
                        "id": $.id,
                        "title": $COMPONENT.title ? $COMPONENT.title : $.id,
                        "direction": $.direction ? $.direction : '--',
                        "link_title": $.title,
                        "entity": $COMPONENT.entity ? $COMPONENT.entity : "component",
                        "namespaces":[$MKNS($NAMESPACES_IDS)],
                        "contract": $CONTRACT ? {
                            "id": $.contract,
                            "location": $CONTRACT.location
                        } : undefined
                    }
                )],
                "aspects": [$COMPONENT.aspects.$spread().(
                    $ASPECT := $lookup($MANIFEST.aspects, $);
                    {
                    "id": $,
                    "title": $ASPECT.title ? $ASPECT.title : $
                })]
            }
        )]^(order)[]
    }
)
`;
 */

const SCHEMA_COMPONENT = `
(
    $MANIFEST := $;
    $CONTEXT_ID := 'self';
    $CONTEXT := {"title": "Собственный"};
    $ARRLEFT := function($ARR ,$COUNT) {
        $map($ARR, function($v, $i) {
            $i < $COUNT ? $v : undefined
        })
    };
    $MKNS := function($IDS) {(
        $map($IDS, function($v, $i) {(
            $ID := $join($ARRLEFT($IDS, $i + 1), ".");
            $NAMESPACE := $lookup($MANIFEST.namespaces, $ID);
            {
                "id": $ID,
                "title": $NAMESPACE and $NAMESPACE.title ? $NAMESPACE.title : $ID,
                "type": $NAMESPACE.type
            }
        )})
    )};
    $COMPONENT_ID := '{%COMPONENT_ID%}';
    $COMPONENT := $lookup($MANIFEST.components, $COMPONENT_ID);
    {
        "title": $CONTEXT.title,
        "id": $CONTEXT_ID,
        "components": [$COMPONENT.(
            $NAMESPACES_IDS := $split($COMPONENT_ID, ".");
            $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
            });
            {
                "order": $NAMESPACE_ID & ":" & $COMPONENT_ID,
                "id": $COMPONENT_ID,
                "title": $COMPONENT.title,
                "entity": $COMPONENT.entity,
                "type": $COMPONENT.type,
                "namespaces":[$MKNS($NAMESPACES_IDS)],
                "is_context": $lookup($MANIFEST.contexts, $COMPONENT_ID) ? true : false,
                "contexts": $distinct(
                    $MANIFEST.contexts.$spread()[$COMPONENT_ID in *.components].$keys()[0]
                ),
                "links": [$distinct($COMPONENT.links).(
                    $COMPONENT := $lookup($MANIFEST.components, $.id);
                    $NAMESPACES_IDS := $split($.id, ".");
                    $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                        $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                    });
                    $CONTRACT := $lookup($MANIFEST.docs, $.contract);
                    {
                        "id": $.id,
                        "title": $COMPONENT.title ? $COMPONENT.title : $.id,
                        "direction": $.direction ? $.direction : '--', 
                        "link_title": $.title,
                        "entity": $COMPONENT.entity ? $COMPONENT.entity : "component",
                        "namespaces":[$MKNS($NAMESPACES_IDS)],
                        "contract": $CONTRACT ? {
                            "id": $.contract, 
                            "location": $CONTRACT.location
                        } : undefined
                    }
                )],
                "aspects": [$COMPONENT.aspects.$spread().(
                    $ASPECT := $lookup($MANIFEST.aspects, $);
                    {
                    "id": $,
                    "title": $ASPECT.title ? $ASPECT.title : $
                })]
            }
        )]^(order)[]
    }
)
`;

const SCHEMA_QUERY = `
(
    $MANIFEST := $;
    $CONTEXT_ID := '{%CONTEXT_ID%}';
    $CONTEXT := $CONTEXT_ID = 'self' ? {"title": "Собственный"} : $lookup($MANIFEST.contexts, $CONTEXT_ID);
    $ARRLEFT := function($ARR ,$COUNT) {
        $map($ARR, function($v, $i) {
            $i < $COUNT ? $v : undefined
        })
    };
    $MKNS := function($IDS) {(
        $map($IDS, function($v, $i) {(
            $ID := $join($ARRLEFT($IDS, $i + 1), ".");
            $NAMESPACE := $lookup($MANIFEST.namespaces, $ID);
            {
                "id": $ID,
                "title": $NAMESPACE and $NAMESPACE.title ? $NAMESPACE.title : $ID,
                "type": $NAMESPACE.type
            }
        )})
    )};
    {
        "title": $CONTEXT.title ? $CONTEXT.title : $CONTEXT_ID,
        "id": $CONTEXT_ID,
        "uml": $CONTEXT.uml,
        "extra": $CONTEXT."extra-links",
        "components": [components.$spread().(
            $COMPONENT_ID := $keys()[0];
            $NAMESPACES_IDS := $split($keys()[0], ".");
            $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
            });
            {
                "order": $NAMESPACE_ID & ":" & $keys()[0],
                "id": $COMPONENT_ID,
                "title": $.*.title,
                "entity": $.*.entity,
                "type": $.*.type,
                "namespaces":[$MKNS($NAMESPACES_IDS)],
                "contexts": $distinct(
                    $MANIFEST.contexts.$spread()[$COMPONENT_ID in *.components].$keys()[0]
                ),
                "links": [$distinct($.*.links).(
                    $COMPONENT := $lookup($MANIFEST.components, $.id);
                    $NAMESPACES_IDS := $split($.id, ".");
                    $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                        $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                    });
                    $CONTRACT := $lookup($MANIFEST.docs, $.contract);
                    {
                        "id": $.id,
                        "title": $COMPONENT.title ? $COMPONENT.title : $.id,
                        "direction": $.direction ? $.direction : '--',
                        "link_title": $.title,
                        "entity": $COMPONENT.entity ? $COMPONENT.entity : "component",
                        "namespaces":[$MKNS($NAMESPACES_IDS)],
                        "contract": $CONTRACT ? {
                            "id": $.contract,
                            "location": $CONTRACT.location
                        } : undefined
                    }
                )],
                "aspects": [$.*.aspects.$spread().(
                    $ASPECT := $lookup($MANIFEST.aspects, $);
                    {
                    "id": $,
                    "title": $ASPECT.title ? $ASPECT.title : $
                })]
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
            "location": 'architect',
            "route": 'architect/',
            "expand": true,
            "icon": 'home'
        },
        {
            "title": "Контексты",
            "location": 'architect/contexts',
            "icon": 'location_searching'
        },
        {
            "title": "Аспекты",
            "location": 'architect/aspects',
            "icon": 'visibility',
            "route": 'aspects/'
        },
        {
            "title": 'Документы',
            "location": 'docs',
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
        },
        {
            "title": 'Проблемы',
            "route": 'problems',
            "icon": 'report_problem'
        }
    ]
).{
    "title": title,
    "route": route ? '/' & route : undefined,
    "icon": icon,
    "location": location ? location : route
}^(location)
`;

const CONTEXTS_QUERY_FOR_COMPONENT = `
(
    $MANIFEST := $;
    [contexts.$spread().(
        $CONTEXT := $;
        $ID := $keys()[0];
        $.*.components[$ = '{%COMPONENT%}'].{
            "id": $ID,
            "title": $CONTEXT.*.title
        }
        
    )]
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

const DOCUMENTS_FOR_ENTITY_QUERY = `
(
    $ENTITY_ID := '{%ENTITY%}';
    $MANIFEST := $;
    [docs.$spread().(
        $LINK := "/docs/" & $keys()[0];
        $ENTITY_ID in *.subjects ?
        [$[$ENTITY_ID in *.subjects]
            {
                "location": *.location,
                "title": *.description,
                "link": $LINK
            }] : undefined;
    )^(location)];
)
`;

const COMPONENT_LOCATIONS_QUERY = `
(
    $COMPONENT_ID := '{%COMPONENT%}';
    [$distinct($[$substring(path, 0, $length($COMPONENT_ID) + 12) = '/components/' & $COMPONENT_ID].location)]
)
`;

const SUMMARY_ASPECT_QUERY = `
(
    $ASPECT_ID := '{%ASPECT%}';
    $MANIFEST := $;
    $lookup(aspects, $ASPECT_ID).(
        $ASPECT := $;
        $FORM := $MANIFEST.forms["aspect" in entity].fields;
        $FIELDS := $append([
            {
                "title": "Идентификатор",
                "content": $ASPECT_ID,
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
            "content": $lookup($ASPECT, $keys()[0]),
            "field": $keys()[0]
        });
    )
)
`;

const ASPECT_LOCATIONS_QUERY = `
(
    $ASPECT_ID := '{%ASPECT%}';
    [$distinct($[$substring(path, 0, $length($ASPECT_ID) + 9) = '/aspects/' & $ASPECT_ID].location)]
)
`;

const CONTEXTS_QUERY_FOR_ASPECT = `
(
    $MANIFEST := $;
    [$distinct(
    components.$spread().(
        $COMPONENT_ID := $keys()[0];
        $COMPONENT := $lookup($MANIFEST.components, $COMPONENT_ID);
        $COMPONENT['{%ASPECT%}' in aspects] ? 
        (
            [$MANIFEST.contexts.$spread()[$COMPONENT_ID in *.components].(
                {
                    "id": $keys()[0],
                    "title": *.title
                }
            )];
        ) : undefined
    ))];
)
`;

const COMPONENTS_QUERY_FOR_ASPECT = `
(
    $MANIFEST := $;
    components.$spread().(
        $KEY := $keys()[0];
        $.*.aspects[$ = '{%ASPECT%}'] ? [(
            $COMPONENT := $lookup($MANIFEST.components, $KEY);
            {
                "title": $COMPONENT.title,
                "id" : $KEY
            }
        )]
    )
)
`;

const TECHNOLOGIES_QUERY = `
(
    $MANIFEST := $;
    $distinct($distinct(components.*.technologies).(
        $TECHKEY := $;
        $TECHNOLOGY := $lookup($MANIFEST.technologies.items, $type($)="string" ? $ : undefined);
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
            "status": $TECHNOLOGY.status,
            "section" : {
                "key": $TECHNOLOGY.section,
                "title": $SECTION.title ? $SECTION.title : "Не определено"
            }
        }
    ))
)
`;

const TECHNOLOGY_QUERY = `
(
    $MANIFEST := $;
    $TECH_ID := '{%TECH_ID%}';
    $TECHNOLOGY := $lookup(technologies.items, $TECH_ID);
    $TECHNOLOGY := $TECHNOLOGY ? $TECHNOLOGY : technologies.items.*[$TECH_ID in aliases];
    $COMPONENTS := [$distinct([
            $MANIFEST.components.*[$TECH_ID in technologies].%, 
            $TECHNOLOGY.aliases.(
                $ALIAS := $;
                $MANIFEST.components.*[$ALIAS in technologies].%;
            )
        ]).$spread().{
            "id": $keys()[0],
            "title": *.title,
            "entity": *.entity ? *.entity : "component",
            "contexts": [*.presentations.contexts.$spread().(
                $CONTEXT := $lookup($MANIFEST.contexts, $);
                {
                    "id": $,
                    "title": $CONTEXT.title ? $CONTEXT.title : $
                }
            )],
            "technologies": [*.technologies]
        }[$TECH_ID in technologies]];
    $CONTEXTS := $distinct($COMPONENTS.contexts);
    {
        'title': $TECHNOLOGY.title,
        'link': $TECHNOLOGY.link,
        'aliases': $TECHNOLOGY.aliases,
        'components': $COMPONENTS,
        'contexts': $CONTEXTS
    }
)
`;

const ARCH_MINDMAP_COMPONENTS_QUERY = `
(
    $FILTER := '{%ROOT%}';
    $FILTER_LN := $length($FILTER);
    [[components.$spread().(
        $ID := $keys()[0];
        $PREFIX := $substring($ID, 0, $FILTER_LN + 1);
        $FILTER_LN = 0 or $PREFIX = $FILTER or $PREFIX = ($FILTER & ".") ? (
        {
            "id": $ID,
            "title": $.*.title
        }) : undefined
    )]^(id)]
)`;

const ARCH_MINDMAP_ASPECTS_QUERY = `
(
    $MANIFEST := $;
    $FILTER := '{%ROOT%}';
    $FILTER_LN := $length($FILTER);
    $USED_ASPECTS := $distinct($.components.*.aspects);
    $ASPECTS := $.aspects.$spread().$keys()[0];
    [[$append($USED_ASPECTS, $ASPECTS).(
        $PREFIX := $substring($, 0, $FILTER_LN + 1);
        $FILTER_LN = 0 or $PREFIX = $FILTER or $PREFIX = ($FILTER & ".") ? (
            $ASPECT := $lookup($MANIFEST.aspects, $);
            {
                "id": $,
                "title": $ASPECT.title ? $ASPECT.title : id,
                "used": $ in $USED_ASPECTS
            }
        ) : undefined
    )]^(id)]
)`;

const PROBLEMS_QUERY = `
(
    $MANIFEST := $;
    $NOFOUND_COMPONENTS := [
        $map($distinct($MANIFEST.contexts.*.components), function($v) {
            (
                $COMPONENT := $lookup($MANIFEST.components, $v);
                $exists($COMPONENT) ? undefined : {
                    "problem": 'Несуществующие компонент',
                    "id": $v,
                    "title": "Ссылка на несуществующий компонент [" & $v & "]",
                    "route": '/architect/components/' & $v
                }
            )
        })
    ];    
    $LOST_COMPONENTS := [
        components.$spread().{
            "problem": 'Компонент вне контекста',
            "id": $keys()[0],
            "title": *.title,
            "route": '/architect/components/' & $keys()[0]
        }.(
            $ID := id;
            $exists($MANIFEST.contexts.*.components[$ = $ID]) 
            ? undefined
            : $
        )
    ];
    $UNDEFINED_NAMESPACES := (
        $ens := function($id) {
            (
                $ids := $split($id, ".");
                $join($map($ids, function($v, $i, $a) {
                        $i < $count($ids) - 1 ? $v : undefined
                }), ".")
            )
        };
        [
            components.$spread().{
                "id": $keys()[0],
                "route": "architect/components/" & $keys()[0],
                "title": title,
                "namespace": $ens($keys()[0]),
                "entity": "компоненте"
            }
        ].(
            $exists($lookup($MANIFEST.namespaces, namespace)) ? undefined :
            {
                "problem": 'Область имен отсутствует',
                "route": route,
                "title": namespace & " в " & entity & " " & title & " [" & id & "]"
            }
        )
    );
    $UNDEFINED_COMPONENT := 
        [
            components.$spread().(
                $COMPONENT_ID := $keys()[0];
                $COMPONENT := $lookup($MANIFEST.components, $COMPONENT_ID);
                $COMPONENT.presentations.links[$not($exists($lookup($MANIFEST.components, id)))].(
                    id ?
                    {
                        "problem": 'Компоненты не описаны',
                        'route': '/architect/components/' & $COMPONENT_ID,
                        "title": "Зависимость [" & id & "] не описана для компонента " & $COMPONENT_ID
                    } : undefined
                )
            )
        ];
    $UNDEFINED_ASPECT := 
        [
            components.$spread().(
                $COMPONENT_ID := $keys()[0];
                $COMPONENT := $lookup($MANIFEST.components, $COMPONENT_ID);
                $COMPONENT.aspects.(
                    $lookup($MANIFEST.aspects, $) ? undefined :                     {
                        "problem": 'Аспекты не определены',
                        'route': '/architect/aspects/' & $,
                        "title": "Аспект не описан [" & $ & "]"
                    }
                )
            )
        ];
    [
        $distinct($NOFOUND_COMPONENTS),
        $distinct($UNDEFINED_CONTEXTS),
        $distinct($LOST_COMPONENTS),
        $distinct($UNDEFINED_NAMESPACES),
        $distinct($UNDEFINED_COMPONENT),
        $distinct($UNDEFINED_ASPECT)
    ]
)
`;

/*
    $FIELD_ERRORS := [
        (
            $MANIFEST := $;
            [components.$spread().(
                $COMPONENT := $;
                $ID := $keys()[0];
                $.*.expert ? undefined : {
                    "problem": "Ошибки в полях",
                    "id": $ID,
                    "title": "Не указан эксперт в компоненте [" & $COMPONENT.*.title & "]",
                    "route": '/architect/components/' & $ID
                }
            )]
        )
    ];
*/

// $distinct($FIELD_ERRORS),

export default {
    // Меню
    menu () {
        return MENU_QUERY;
    },
    // Запрос по контексту
    context(context) {
        return SCHEMA_CONTEXT.replace(/{%CONTEXT_ID%}/g, context);
    },
    // Запрос по компоненту
    component(component) {
        return SCHEMA_COMPONENT.replace(/{%COMPONENT_ID%}/g, component)
    },
    // Запрос контекстов в которых встречается компонент
    contextsForComponent(component) {
        return CONTEXTS_QUERY_FOR_COMPONENT.replace(/{%COMPONENT%}/g, component)
    },
    // Сводка по компоненту
    summaryForComponent(component) {
        return SUMMARY_COMPONENT_QUERY.replace(/{%COMPONENT%}/g, component)
    },
    // Определение размещения манифестов описывающих компонент
    locationsForComponent(component) {
        return COMPONENT_LOCATIONS_QUERY.replace(/{%COMPONENT%}/g, component)
    },
    // Запрос по аспекту
    aspect(aspect, context) {
        return SCHEMA_QUERY
            .replace(/{%CONTEXT_ID%}/g, context || 'self')
            .replace(/{%CONDITIONS%}/g, `'${aspect}' in aspects.id`)
    },
    // Сводка по аспекту
    summaryForAspect(aspect) {
        return SUMMARY_ASPECT_QUERY.replace(/{%ASPECT%}/g, aspect)
    },
    // Определение размещения манифестов описывающих аспект
    locationsForAspect(aspect) {
        return ASPECT_LOCATIONS_QUERY.replace(/{%ASPECT%}/g, aspect)
    },
    // Запрос контекстов в которых встречается аспект
    contextsForAspects(aspect) {
        return CONTEXTS_QUERY_FOR_ASPECT.replace(/{%ASPECT%}/g, aspect)
    },
    // Запрос компонентов в которых встречается аспект
    componentsForAspects(aspect) {
        return COMPONENTS_QUERY_FOR_ASPECT.replace(/{%ASPECT%}/g, aspect)
    },
    // Сбор информации об использованных технологиях
    collectTechnologies() {
        return TECHNOLOGIES_QUERY;
    },
    // Карточка технологии
    summaryForTechnology(technology) {
        return TECHNOLOGY_QUERY.replace(/{%TECH_ID%}/g, technology);
    },
    // Выявление проблем
    problems() {
        return PROBLEMS_QUERY;
    },
    // Документы для сущности
    docsForEntity(entity) {
        return DOCUMENTS_FOR_ENTITY_QUERY.replace(/{%ENTITY%}/g, entity);
    },
    // MindMap по архитектурным компонентам
    archMindMapComponents(root) {
        return ARCH_MINDMAP_COMPONENTS_QUERY.replace(/{%ROOT%}/g, root || '');
    },
    // MindMap по архитектурным аспектам
    archMindMapAspects(root) {
        return ARCH_MINDMAP_ASPECTS_QUERY.replace(/{%ROOT%}/g, root || '');
    }
}
