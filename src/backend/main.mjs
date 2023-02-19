import logger from './utils/logger.mjs';
import storeManager from './storage/manager.mjs';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jsonata from '../global/jsonata/driver.mjs';

// Подключаем переменные среды
import dotenv from 'dotenv';
dotenv.config();

const LOG_TAG = 'server';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//const express = require('express');
const app = express();
const serverPort = 3000;

// Расположение собранного SPA приложения
const rootHref = '/';
const spaFolder = path.join(__dirname, '../../dist/');

let manifest = null;

// Ввполняет JSONata запрос
app.get('/core/jsonata/query', function(req, res) {
    if (!manifest) {
        res.status(503);
        return;
    }
    const request = req.query.request; 
    logger.log(`Received JSONata request (${request})`, LOG_TAG);
    const expression = jsonata.expression(req.query.request);
    try {
        res.json(expression.evaluate(manifest));
    } catch (e) {
        res.status(500);
        res.render('error', e);
    }
});

app.use(rootHref, express.static(spaFolder));
app.use(rootHref, function(req, res) {
    res.sendFile(path.join(spaFolder, 'index.html'));
});

// Основной цикл приложения
const mainLoop = async function() {
    // Загружаем манифест
    manifest = await storeManager.reloadManifest();

    app.listen(serverPort, function(){
        logger.log(`DocHub server running on ${serverPort}`, LOG_TAG);
    });
};

mainLoop();
