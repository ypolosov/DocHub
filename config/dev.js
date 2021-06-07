export default {
    "gitlab_server": "https://foo.local/", // Адрес тестового GitLab сервера
    "root_manifest" : {
        "project_id": 13, // Идентификатор проекта в котором размещен корневой манифест
        "branch": "dev" // Ветка в которой размещен корневой манифест
    },
    "oauth" : {
        "APP_ID": "Application token from gitlab", // Идентификатор приложения в GitLab
        "CLIENT_SECRET": "Client secret from gitlab", // Секрет приложения  в GitLab
        "REQUESTED_SCOPES": "read_repository+api"
    }
}
