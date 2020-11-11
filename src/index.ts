import { connectTronConsumer } from "./kafka/tron.kafka"
import { connectCoinProducer } from "./kafka/coin.kafka"
import { connectRedis } from "./redis"

const start = async () => {
    try {
        await connectRedis()

        await connectTronConsumer()
        
        await connectCoinProducer()
    } catch (e) {
        throw e
    }
}

start()