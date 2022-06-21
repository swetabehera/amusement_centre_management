import redis from 'redis';
import bluebird from 'bluebird';

export default function (app) {
    bluebird.promisifyAll(redis.RedisClient.prototype);
    bluebird.promisifyAll(redis.Multi.prototype);

    const redisConfig = app.get('redis');

    const RedisClient = redis.createClient(redisConfig);

    app.set('RedisClient', RedisClient);
}
