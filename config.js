export default {
    "gitlab_server": process.env.VUE_APP_DOCHUB_GITLAB_URL, // Адрес GitLab сервера
    "root_manifest" : {
        "project_id": process.env.VUE_APP_DOCHUB_MANIFEST_PROJECT_ID, // Идентификатор проекта в котором размещен корневой манифест
        "branch": process.env.VUE_APP_DOCHUB_MANOFEST_PROJECT_BRANCH // Ветка в которой размещен корневой манифест
    },
    "oauth" : {
        "APP_ID": process.env.VUE_APP_DOCHUB_APP_ID, // Идентификатор приложения в GitLab
        "CLIENT_SECRET": process.env.VUE_APP_DOCHUB_CLIENT_SECRET, // Секрет приложения  в GitLab
        "REQUESTED_SCOPES": "read_repository+api"
    }
};
