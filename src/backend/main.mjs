import './helpers/env.mjs';
import logger from './utils/logger.mjs';
import storeManager from './storage/manager.mjs';
import express from 'express';
import middlewareCompression from './middlewares/compression.mjs';
import controllerStatic from './controllers/static.mjs';
import controllerCore from './controllers/core.mjs';
import middlewareAccess from './middlewares/access.mjs';

const LOG_TAG = 'server';

//const express = require('express');
const app = express();
const serverPort = process.env.VUE_APP_DOCHUB_BACKEND_PORT || 3030;

// Актуальный манифест
app.storage = null;

// Подключаем контроль доступа
middlewareAccess(app);

// Подключаем сжатие контента
middlewareCompression(app);

// API ядра
controllerCore(app);

// Статические ресурсы
controllerStatic(app);

// Основной цикл приложения
const mainLoop = async function() {
    // Загружаем манифест
    app.storage = await storeManager.reloadManifest();

    app.listen(serverPort, function(){
        logger.log(`DocHub server running on ${serverPort}`, LOG_TAG);
    });
};

mainLoop();
