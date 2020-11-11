import { EachMessagePayload, Kafka } from "kafkajs";
import { coinKafkaConfig } from "../config";
import { watchConsumer } from "../service/watch.consumer";


const coinKafka = new Kafka({
    clientId: coinKafkaConfig.clientId,
    brokers: coinKafkaConfig.brokers.split(',') || []
})

const coinConsumer = coinKafka.consumer({ groupId: coinKafkaConfig.groupId })
const coinProducer = coinKafka.producer({ allowAutoTopicCreation: true })

const connectCoinConsumer = async () => {
    try {
        await coinConsumer.connect()
        console.log(`coin consumer connected`);

        for (const key of Object.keys(coinKafkaConfig.topic.consume)) {
            const topic = coinKafkaConfig.topic.consume[key]

            await coinConsumer.subscribe({ topic, fromBeginning: true })

            console.log(`subcribed topic ${topic}`)
        }

        await coinConsumer.run({
            eachMessage: async (payload: EachMessagePayload) => {
                try {
                    const { topic, message } = payload

                    switch (topic) {
                        case coinKafkaConfig.topic.consume.watch:
                            await watchConsumer(message)
                            break;

                        default: throw new Error(`consumer for topic ${topic} not found`)
                    }
                } catch (e) {
                    throw e
                }
            }
        })

    } catch (e) {
        throw e
    }
}

const connectCoinProducer = async () => {
    try {
        await coinProducer.connect()
        console.log(`coin producer connected`);
    } catch (e) {
        console.error(`coin producer not connected`);
        throw e
    }
}

export {
    coinProducer,
    connectCoinProducer
}