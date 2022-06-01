export default {
    plugin: {
        ROOT_MANIFEST: 'plugin:/idea/source/$root'
    },
    pages: {
        OAUTH_CALLBACK_PAGE: '/sso/gitlab/authentication',
        MAIN_PAGE: '/main'
    },
    transports: {
        HTTP: 'http',
        GITLAB: 'gitlab'
    },
    manifest: {
        wokers: {
            LOADER: 'manifest-worker-loader'
        },
        events: {
            LOADING: 'manifest-loading',        // Манифест загружается
            LOADED: 'manifest-loaded',          // Манифест загружен
            IMPORTING: 'manifest-importing',    // Загружается подключаемый манифест
            IMPORTED: 'manifest-imported',      // Подключаемый манифест загружен
            IMPORT_ERROR: 'manifest-import-ERROR',      // Ошибка загруки подключаемого манифеста
        }
    }
}

