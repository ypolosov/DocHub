export default {
    "gitlab_server": "https://foo.local/", // Адрес GitLab сервера
    "root_manifest" : {
        "project_id": 13, // Идентификатор проекта в котором размещен корневой манифест
        "branch": "dev" // Ветка в которой размещен корневой манифест
    },
    "oauth" : {
        "APP_ID": process.env.DOCHUB_APP_ID, // Идентификатор приложения в GitLab
        "CLIENT_SECRET": process.env.DOCHUB_CLIENT_SECRET, // Секрет приложения  в GitLab
        "REQUESTED_SCOPES": "read_repository+api"
    }
}
