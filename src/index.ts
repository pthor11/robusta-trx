import { connectTronConsumer } from "./kafka"
import { connectRedis, getAsync } from "./redis"

const start = async () => {
    try {
        await connectRedis()

        await connectTronConsumer()
    } catch (e) {
        throw e
    }
}

start()