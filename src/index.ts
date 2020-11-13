import { connectTronConsumer } from "./kafka/tron.kafka"
import { connectCoinProducer, connectCoinConsumer } from "./kafka/coin.kafka"
import { connectRedis } from "./redis"

const start = async () => {
    try {
        await connectRedis()

        await connectCoinProducer()

        await connectTronConsumer()

        await connectCoinConsumer()
    } catch (e) {
        throw e
    }
}

start()