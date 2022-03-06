import requests from "../helpers/requests";
import axios from 'axios';
import plantUML from '../helpers/plantuml'

export default {
    request(params) {
        params.url = window.origin + params.url.slice(19);
        return requests.axios(params);
    },
    rootManifest() {
        return process.env.VUE_APP_DOCHUB_ROOT_MANIFEST || 'example/root.yaml';
    },
    renderPlantUML(uml) {
        return axios({url: plantUML.svgURL(uml)});
    }
}