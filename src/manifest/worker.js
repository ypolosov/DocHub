// import jsonata from "jsonata";

import loader from './loader';

addEventListener('message', event => {
    const data = JSON.parse(event.data);
    switch (data.action) {
        case 'load': 
            loader.load(data.uri);
            break;
        default:
            // eslint-disable-next-line no-console
            console.error(`Manifest worker: Unknown action ${event.data.action}`);
    }
});