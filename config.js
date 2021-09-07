const config = {};

// eslint-disable-next-line no-console
console.info('ENVIRONMENTS:');

for(const key in process.env) {
    // eslint-disable-next-line no-console
    console.info(`  ${key}=`, JSON.stringify(process.env[key]))
}
// eslint-disable-next-line no-console
console.info('------------');

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

config.root_manifest = process.env.VUE_APP_DOCHUB_ROOT_MANIFEST || 'example/root.yaml';

export default config;
