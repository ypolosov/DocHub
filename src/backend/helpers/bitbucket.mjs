import bitbucketDriver from '../../global/bitbucket/driver.mjs';

const config = {
    bitbucket_server: process.env.VUE_APP_DOCHUB_BITBUCKET_URL,
    personalToken: process.env.VUE_APP_DOCHUB_PERSONAL_TOKEN
};

export default new bitbucketDriver(config);
