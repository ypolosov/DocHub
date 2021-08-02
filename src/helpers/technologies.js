// Список пакетов в репе https://docs.gitlab.com/ee/api/packages.html
// Статистика по проекту https://docs.gitlab.com/ee/api/project_statistics.html
// components.*['sberuslugi@spt_auth_c2c' in aspects].presentations['global' in contexts].%
// components.$spread().{
//     "component": *,
//     "id": $keys()[0]
// }.component['sberuslugi@spt_chat' in aspects].%
// *[$type($)='string'].%
/*
[
    {
        'title': 'Архитектура',
        'route': 'architect'
    },
    {
        'title': 'Контектсты',
        'route': 'architect/contexts'
    },
        contexts.$spread().{
            "title": $.*.title,
            "route": 'architect/contexts/' & $keys()[0]
    },
    {
        'title': 'Аспекты',
        'route': 'architect/aspects'
    },
    aspects.$spread().{
        "title": $.*.title,
        "route": 'architect/aspects/' & $keys()[0]
    },
    {
        'title': 'Документы',
        'route': 'docs'
    },
    docs.$spread().{
        "title": $.*.description,
        "route": 'docs/' & $keys()[0]
    }
]
*/
