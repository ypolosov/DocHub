const config = {};

if(!process.env.VUE_APP_DOCHUB_GITLAB_URL) {
    // eslint-disable-next-line no-console
    console.warn('Not specified the URL of the GitLab (VUE_APP_DOCHUB_GITLAB_URL)');
    config.oauth = false;
} else {
    if(!process.env.VUE_APP_DOCHUB_CLIENT_SECRET)
        throw 'Not specified the application secret at GitLab (VUE_APP_DOCHUB_CLIENT_SECRET)';

    if(!process.env.VUE_APP_DOCHUB_APP_ID)
        throw 'Not specified the application ID at GitLab (VUE_APP_DOCHUB_APP_ID)';

    config.gitlab_server = process.env.VUE_APP_DOCHUB_GITLAB_URL;
    config.oauth = {
        "APP_ID": process.env.VUE_APP_DOCHUB_APP_ID,
        "CLIENT_SECRET": process.env.VUE_APP_DOCHUB_CLIENT_SECRET,
        "REQUESTED_SCOPES": "read_repository+api"
    }
}

if(!process.env.VUE_APP_DOCHUB_ROOT_MANIFEST)
    throw 'Not specified the URL of the root manifest (VUE_APP_DOCHUB_ROOT_MANIFEST)';

config.root_manifest = process.env.VUE_APP_DOCHUB_ROOT_MANIFEST;

export default config;
