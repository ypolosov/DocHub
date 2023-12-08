// Обеспечивает подключение к Redis
import logger from '../utils/logger.mjs';
import { createClient } from 'redis';

const LOG_TAG = 'redis-driver';

let client = null;

export default async function() {
    if (client) return client;
    const url = process.env.VUE_APP_DOCHUB_REDIS_URL;
    client = url ? createClient({url}) : createClient();
    client.on('error', err => logger.log(`Error of redis client: ${err.toString()}`, LOG_TAG));
    await client.connect();
    logger.log('Redis client is enabled', LOG_TAG);
    return client;
}
