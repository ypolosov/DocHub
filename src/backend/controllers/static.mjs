import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (app) => {
    // Определяет статические роуты
    app.spaFolder = path.join(__dirname, '../../../dist/');
    app.rootHref = '/';
    
    app.use(app.rootHref, express.static(app.spaFolder));
    app.use(app.rootHref, function(req, res) {
        res.sendFile(path.join(app.spaFolder, 'index.html'));
    });
};

