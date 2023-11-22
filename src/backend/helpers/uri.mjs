import uriToolConstructor from '../../global/manifest/tools/uri.mjs';

const config = {
    gitlab_server: process.env.VUE_APP_DOCHUB_GITLAB_URL,
    bitbucket_server: process.env.VUE_APP_DOCHUB_BITBUCKET_URL,
    personalToken: process.env.VUE_APP_DOCHUB_PERSONAL_TOKEN
};

export default new uriToolConstructor(config);
