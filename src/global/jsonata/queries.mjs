const QUERY_ID_USER_MENU = 'f3ee63af-bcd6-49bb-bc2a-a9849772e602';

// Строит пользовательское меню
// Предопределенные запросы
const queries = {
    // Строит пользовательское меню
    'f3ee63af-bcd6-49bb-bc2a-a9849772e602': `
    (
        $isURL := $matcher := /^[a-zA-Z]*\\:.*$/i;
        $isRoot := $matcher := /^\\/.*$/i;
    
        $append((
            $GET_TITLE := function($LOCATION) {(
                $STRUCT := $split($LOCATION, "/");
                $STRUCT[$count($STRUCT) - 1];
            )};
        
            $MANIFEST := $;
            $append([
                    {
                        "title": 'Архитектура',
                        "location": 'Архитектура',
                        "route": 'architect/',
                        "expand": true,
                        "icon": 'home'
                    },
                    {
                        "title": "Контексты",
                        "location": 'Архитектура/Контексты',
                        "icon": 'location_searching'
                    },
                    {
                        "title": "Аспекты",
                        "location": 'Архитектура/Аспекты',
                        "icon": 'visibility',
                        "route": 'aspects/'
                    },
                    {
                        "title": 'Документы',
                        "location": 'Документы',
                        "expand": true,
                        "icon": 'description'
                    },
                    contexts.$spread().{
                        "title": $GET_TITLE($.*.location ? $.*.location : $keys()[0]),
                        "route": 'architect/contexts/' & $keys()[0],
                        "hiden": $.*.location ? false : true,
                        "location": 'Архитектура/Контексты/' & $.*.location,
                        "icon": $.*.icon ? $.*.icon : ''
                    },
                    aspects.$spread().{
                        "title": $GET_TITLE($.*.location),
                        "route": 'architect/aspects/' & $keys()[0],
                        "location": 'Архитектура/Аспекты/' & $.*.location,
                        "icon": $.*.icon ? $.*.icon : ''
                    },
                    docs.$spread().{
                        "title": $GET_TITLE($.*.location),
                        "route": 'docs/' & $keys()[0],
                        "hiden": $.*.location ? false : true,
                        "location": 'Документы/' & $.*.location,
                        "icon": $.*.icon ? $.*.icon : ''
                    },
                    {
                        "title": 'Техрадар',
                        "location": 'Техрадар',
                        "route": 'techradar',
                        "icon": 'track_changes'
                    },
                    technologies.sections.$spread().{
                        "title": $.*.title,
                        "route": 'techradar/' & $keys()[0],
                        "location": 'Техрадар/' & $.*.title
                    },
                    {
                        "title": 'Проблемы',
                        "location": 'Проблемы',
                        "route": 'problems',
                        "icon": 'report_problem'
                    }
                ][($exists(hiden) and $not(hiden)) or $not($exists(hiden))],
                entities.*.(
                    $eval(menu, $MANIFEST).{
                        "route": link,
                        "location": location,
                        "icon": icon,
                        "title": $GET_TITLE(location)
                    }
                )
            )
        ).{
            "title": "" & title,
            "route": route ? (
                $isURL(route) ? route
                : ($isRoot(route) ? route : '/' & route)
            ) : undefined,
            "icon": icon,
            "location": "" & (location ? location : route)
        }^(location), [
            {
                "title": 'JSONata',
                "route": '/devtool',
                "icon": 'chrome_reader_mode',
                "location": "devtool"
            }
        ])
    )
    `
};

export default {
    // Строит пользовательское меню
    USER_MENU: queries[QUERY_ID_USER_MENU]
};

