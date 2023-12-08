export default {
    // Проверяет доступность сервиса
    isServiceReady: function(app, res) {
        if (!app.storage) {
            res.set('Retry-After', '60') // Попробуй через 60 секунд
            .status(503)
            .json({});
            return false;
        }
        return true;
    }
};
