import logger from './utils/logger.mjs';
import storeManager from './storage/manager.mjs';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const LOG_TAG = 'server';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//const express = require('express');
const app = express();
const serverPort = 3000;

// Расположение собранного SPA приложения
const rootHref = '/';
const spaFolder = path.join(__dirname, '../../dist/');

app.get('/core/jsonata', function(req, res) {
    debugger;
    res.sendFile(path.join(spaFolder, 'index.html'));
});

app.use(rootHref, express.static(spaFolder));
app.use(rootHref, function(req, res) {
    debugger;
    res.sendFile(path.join(spaFolder, 'index.html'));
});

// Основной цикл приложения
const mainLoop = async function() {
    // Загружаем манифест
    await storeManager.reloadManifest();

    app.listen(serverPort, function(){
        logger.log(`DocHub server running on ${serverPort}`, LOG_TAG);
    });
};

mainLoop();
