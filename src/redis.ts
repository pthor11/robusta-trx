import { createClient, RedisClient } from "redis";
import { promisify } from "util";
import { redisUri } from "./config";

let redis: RedisClient
let getKeys: (pattern: string) => Promise<string[]>
let getAsync: (key: string) => Promise<string | null>
let setAsync: (key: string, val: string) => Promise<any>
let delAsync: (keys: string[]) => Promise<any>

const retry_delay = 1000

const connectRedis = async () => new Promise((resolve, reject) => {
    redis = createClient({ url: redisUri })

    redis.on('connect', () => {
        console.log('redis connected')

        getKeys = promisify(redis.keys).bind(redis)
        getAsync = promisify(redis.get).bind(redis)
        setAsync = promisify(redis.set).bind(redis)
        delAsync = promisify(redis.del).bind(redis)

        resolve()
    })

    redis.on("error", function (error) {
        console.error(error);

        redis.end(true)

        console.log(`retry connecting redis in 1s ...`);

        setTimeout(() => {
            redis = createClient({ url: redisUri })
        }, retry_delay)
    });
})

export {
    redis,
    getKeys,
    getAsync,
    setAsync,
    delAsync,
    connectRedis
}