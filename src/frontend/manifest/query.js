import jsonataDriver from '@global/jsonata/driver.mjs';
import queries from '@global/jsonata/queries.mjs';
import env from '@front/helpers/env';
import requests from '@front/helpers/requests';

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
            $TITLE := $lookup($MANIFEST.components, $ID).title;
            $TITLE := $TITLE ? $TITLE : $lookup($MANIFEST.namespaces, $ID).title;
            $TITLE := $TITLE ? $TITLE : $ID;
            {
                "id": $ID,
                "title": $TITLE,
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
            $WILDCARD := $;
            $NAMESPACES_IDS := $split($, ".");
            $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
            });
            $COMPONENT := $ ? $lookup($MANIFEST.components, $);
            $COMPONENTS := $COMPONENT 
                ? [$merge([$COMPONENT, {"id": $}])]
                : [(
                    $MANIFEST.components.$spread().(
                        $wcard($keys()[0], $WILDCARD) 
                        ? $merge([{"id" : $keys()[0]}, $.*])
                    );
                )];
            $COMPONENTS.(
                $COMPONENT_ID   := $.id;
                $COMPONENT      := $;
                {
                    "order": $NAMESPACE_ID & ":" & $COMPONENT_ID,
                    "id": $COMPONENT_ID,
                    "title": $COMPONENT.title,
                    "entity": $COMPONENT.entity ? $COMPONENT.entity : 'component',
                    "type": $COMPONENT.type,
                    "namespaces":[$MKNS($NAMESPACES_IDS)],
                    "is_context": $COMPONENT_ID ? ($lookup($MANIFEST.contexts, $COMPONENT_ID) ? true : false),
                    "links": [$distinct($COMPONENT.links)[id].(
                        $ID := $.id;
                        $COMPONENT := $ID ? $lookup($MANIFEST.components, $ID);
                        $NAMESPACES_IDS := $split($ID, ".");
                        $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                            $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                        });
                        $CONTRACT := $.contract ? $lookup($MANIFEST.docs, $.contract);
                        {
                            "id": $ID,
                            "title": $COMPONENT.title ? $COMPONENT.title : $ID,
                            "direction": $.direction ? $.direction : '--',
                            "link_title": $.title,
                            "entity": $COMPONENT.entity ? $COMPONENT.entity : "component",
                            "namespaces":[$MKNS($NAMESPACES_IDS)],
                            "contract": $.contract ? {
                                "id": $.contract,
                                "location": $CONTRACT.location
                            } : undefined
                        }
                    )],
                    "aspects": [$COMPONENT.aspects.$spread().(
                        $ASPECT := $ ? $lookup($MANIFEST.aspects, $);
                        {
                            "id": $,
                            "title": $ASPECT.title ? $ASPECT.title : $
                        }
                    )]
                }                
            )
            
        )]^(order)[]
    }
)
`;

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
            $TITLE := $lookup($MANIFEST.components, $ID).title;
            $TITLE := $TITLE ? $TITLE : $lookup($MANIFEST.namespaces, $ID).title;
            $TITLE := $TITLE ? $TITLE : $ID;
            {
                "id": $ID,
                "title": $TITLE,
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
                "is_context": $COMPONENT_ID ? ($lookup($MANIFEST.contexts, $COMPONENT_ID) ? true : false),
                "contexts": $distinct(
                    $MANIFEST.contexts.$spread()[$COMPONENT_ID in *.components].$keys()[0]
                ),
                "links": [$distinct($COMPONENT.links).(
                    $COMPONENT := $.id ? $lookup($MANIFEST.components, $.id);
                    $NAMESPACES_IDS := $split($.id, ".");
                    $NAMESPACES_IDS := $map($NAMESPACES_IDS, function($v, $i, $a) {
                        $i < $count($NAMESPACES_IDS) - 1 ? $v : undefined
                    });
                    $CONTRACT := $.contract ? $lookup($MANIFEST.docs, $.contract);
                    {
                        "id": $.id,
                        "title": $COMPONENT.title ? $COMPONENT.title : $.id,
                        "direction": $.direction ? $.direction : '--', 
                        "link_title": $.title,
                        "entity": $COMPONENT.entity ? $COMPONENT.entity : "component",
                        "namespaces":[$MKNS($NAMESPACES_IDS)],
                        "contract": $.contract ? {
                            "id": $.contract, 
                            "location": $CONTRACT.location
                        } : undefined
                    }
                )],
                "aspects": [$COMPONENT.aspects.$spread().(
                    $ASPECT := $ ? $lookup($MANIFEST.aspects, $);
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
            $TITLE := $lookup($MANIFEST.components, $ID).title;
            $TITLE := $TITLE ? $TITLE : $lookup($MANIFEST.namespaces, $ID).title;
            $TITLE := $TITLE ? $TITLE : $ID;
            {
                "id": $ID,
                "title": $TITLE,
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
                        "contract": $.contract ? {
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

const CONTEXTS_QUERY_FOR_COMPONENT = `
(
    $MANIFEST := $;
    [$distinct([contexts.$spread().(
        $CONTEXT := $;
        $ID := $keys()[0];
        *.components[$wcard('{%COMPONENT%}', $)].{
            "id": $ID,
            "title": $CONTEXT.*.title
        }
    )])];
)
`;

const SUMMARY_COMPONENT_QUERY = `
(
    $COMPONENT_ID := '{%COMPONENT%}';
    $MANIFEST := $;
    $lookup(components, $COMPONENT_ID).(
        $COMPONENT := $;
        $ENTITY := $.entity ? $.entity : "component";
        $FORM := $MANIFEST.forms[entity.$contains($ENTITY)].fields;
        
        $append([
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
        ], $merge($FORM).$spread().{
            "title": $.*.title,
            "required": $.*.required,
            "content": $lookup($COMPONENT, $.$keys()),
            "field": $.$keys()
        });
    )
)
`;

const WIDGETS_COMPONENT_QUERY = `
(
	$pres := entities.components.presentations;
	[$pres.blank.widgets.$spread().(
		$merge([{ "id": $keys()[0]}, *])
	)]
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
    )[location]^(location)];
)
`;

const COMPONENT_LOCATIONS_QUERY = `
(
    [$lookup($, '/components/' & '{%COMPONENT%}').{
        "link": $,
        "title": $
    }]
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

const WIDGETS_ASPECT_QUERY = `
(
    $pres := entities.aspects.presentations;
    [$pres.blank.widgets.$spread().(
        $merge([{ "id": $keys()[0]}, *])
    )]
)   
`;

const ASPECT_DEFAULT_CONTEXT = `
(
    $ASPECT_ID := '{%ASPECT%}';
    $MANIFEST := $;
    $lookup(aspects, $ASPECT_ID).(
				$.'default-context'
    )
)
`;

const ASPECT_LOCATIONS_QUERY = `
(
    [$lookup($, '/aspects/' & '{%ASPECT%}').{
        "link": $,
        "title": $
    }]
)
`;

const CONTEXTS_QUERY_FOR_ASPECT = `
(
    $MANIFEST := $;
    [$distinct(
    components.$spread().(
        $COMPONENT_ID := $keys()[0];
        *.['{%ASPECT%}' in aspects] ? 
        (
            [$MANIFEST.contexts.$spread().(
                $CONTEXT_ID := $keys()[0];
                $TITLE := *.title;
                *.components[$wcard($COMPONENT_ID, $)].{
                    "id": $CONTEXT_ID,
                    "title": $TITLE
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
        $TECHNOLOGY := $TECHNOLOGY ? $merge([$TECHNOLOGY, {"id": $TECHKEY}]) : $single(
            $spread(
                $sift($MANIFEST.technologies.items, function($v, $k) {
                    [$TECHKEY in $v.aliases]}
                )
            ), function($v, $k){ $k=0 }).$merge([$.*, {"id": $keys($)}]);
        $TECHNOLOGY := $TECHNOLOGY ? $TECHNOLOGY : {
            "id": $TECHKEY,
            "section": "UNKNOWN",
            "title": "Не определено"
        }; 
        $SECTION := $lookup($MANIFEST.technologies.sections, $TECHNOLOGY.section);
        {
            "label": $TECHNOLOGY.id,
            "key": $TECHNOLOGY.id,
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
    $COMPONENTS := $distinct($append(
            $MANIFEST.components.*[$TECH_ID in technologies], 
            $TECHNOLOGY.aliases.(
                $ALIAS := $;
                $MANIFEST.components.*[$ALIAS in technologies];
            )
    ));
    $COMPONENTS := $filter($MANIFEST.components.$spread(), function($v) {
            $lookup($v, $v.$keys()[0]) in $COMPONENTS
    }).$spread().{
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
        };
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
    [[$append($USED_ASPECTS, $ASPECTS)[$].(
        $PREFIX := $substring("" & $, 0, $FILTER_LN + 1);
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

const JSONSCEMA_ENTITIES_QUERY = `
(
	$manifest := $;
	{
		"type": "object",
		"properties": $merge([
			$manifest.entities.$spread().({
				$keys()[0]: $.*.schema
			})
		]),
		"$defs": $merge([$manifest.entities.*.schema."$defs"])
	};
)
`;

export default {
    driver: jsonataDriver,
    expression(expression, self_, params, isTrace, funcs) {
        if (env.isBackendMode() && expression.startsWith('backend://')) {
            return {
                // eslint-disable-next-line no-unused-vars
                async evaluate(context, def) {
                    const result = await requests.request(expression);
                    return result.data;
                }
            };
        } else 
            return this.driver.expression(expression, self_, params, isTrace, funcs);
    },
	// Меню
	menu() {
		return env.isBackendMode() ? `backend://query-preset/${queries.IDS.USER_MENU}` : queries.QUERIES[queries.IDS.USER_MENU];
	},
	// Запрос по контексту
	context(context) {
		return SCHEMA_CONTEXT.replace(/{%CONTEXT_ID%}/g, context);
	},
	// Запрос по компоненту
	component(component) {
		return SCHEMA_COMPONENT.replace(/{%COMPONENT_ID%}/g, component);
	},
	// Запрос контекстов в которых встречается компонент
	contextsForComponent(component) {
		return CONTEXTS_QUERY_FOR_COMPONENT.replace(/{%COMPONENT%}/g, component);
	},
	// Сводка по компоненту
	summaryForComponent(component) {
		return SUMMARY_COMPONENT_QUERY.replace(/{%COMPONENT%}/g, component);
	},
	// Виджеты компонентов
	widgetsForComponent() {
		return WIDGETS_COMPONENT_QUERY;
	},
	// Определение размещения манифестов описывающих компонент
	locationsForComponent(component) {
		return COMPONENT_LOCATIONS_QUERY.replace(/{%COMPONENT%}/g, component);
	},
	// Запрос по аспекту
	aspect(aspect, context) {
		return SCHEMA_QUERY
			.replace(/{%CONTEXT_ID%}/g, context || 'self')
			.replace(/{%CONDITIONS%}/g, `'${aspect}' in aspects.id`);
	},
	// Сводка по аспекту
	summaryForAspect(aspect) {
		return SUMMARY_ASPECT_QUERY.replace(/{%ASPECT%}/g, aspect);
	},
	widgetsForAspect() {
		return WIDGETS_ASPECT_QUERY;
	},
	defaultContextForAspect(aspect) {
		return ASPECT_DEFAULT_CONTEXT.replace(/{%ASPECT%}/g, aspect);
	},
	// Определение размещения манифестов описывающих аспект
	locationsForAspect(aspect) {
		return ASPECT_LOCATIONS_QUERY.replace(/{%ASPECT%}/g, aspect);
	},
	// Запрос контекстов в которых встречается аспект
	contextsForAspects(aspect) {
		return CONTEXTS_QUERY_FOR_ASPECT.replace(/{%ASPECT%}/g, aspect);
	},
	// Запрос компонентов в которых встречается аспект
	componentsForAspects(aspect) {
		return COMPONENTS_QUERY_FOR_ASPECT.replace(/{%ASPECT%}/g, aspect);
	},
	// Сбор информации об использованных технологиях
	collectTechnologies() {
		return TECHNOLOGIES_QUERY;
	},
	// Карточка технологии
	summaryForTechnology(technology) {
		return TECHNOLOGY_QUERY.replace(/{%TECH_ID%}/g, technology);
	},
	// Документы для сущности
	docsForSubject(entity) {
		return DOCUMENTS_FOR_ENTITY_QUERY.replace(/{%ENTITY%}/g, entity);
	},
	// MindMap по архитектурным компонентам
	archMindMapComponents(root) {
		return ARCH_MINDMAP_COMPONENTS_QUERY.replace(/{%ROOT%}/g, root || '');
	},
	// MindMap по архитектурным аспектам
	archMindMapAspects(root) {
		return ARCH_MINDMAP_ASPECTS_QUERY.replace(/{%ROOT%}/g, root || '');
	},
	// Сводная JSONSchema по всем кастомным сущностям
	entitiesJSONChema() {
		return JSONSCEMA_ENTITIES_QUERY;
	}
};
