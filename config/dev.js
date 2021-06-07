export default {
    "gitlab_server": "https://foo.local/", // Адрес тестового GitLab сервера
    "root_manifest" : {
        "project_id": 13, // Идентификатор проекта в котором размещен корневой манифест
        "branch": "dev" // Ветка в которой размещен корневой манифест
    },
    "oauth" : {
        "APP_ID": "TEST1", // Идентификатор приложения в GitLab
        "CLIENT_SECRET": "TEST2", // Секрет приложения  в GitLab
        "REQUESTED_SCOPES": "read_repository+api"
    }
}
