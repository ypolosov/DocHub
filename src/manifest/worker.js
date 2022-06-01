import jsonata from "jsonata";

addEventListener('message', event => {
    // eslint-disable-next-line no-debugger
    debugger;
    postMessage(jsonata('$').evaluate(JSON.parse(event.data)));
});