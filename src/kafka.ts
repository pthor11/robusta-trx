import { EachMessagePayload, Kafka } from "kafkajs";
import { tronKafkaConfig } from "./config";
import { transactionConsumer } from "./service/transaction.consumer";
import { contracteventConsumer } from "./service/contractevent.consumer";

const tronKafka = new Kafka({
    clientId: tronKafkaConfig.clientId,
    brokers: tronKafkaConfig.brokers?.split(',') || [],
})

const tronConsumer = tronKafka.consumer({ groupId: tronKafkaConfig.groupId })

const connectTronConsumer = async () => {
    try {
        await tronConsumer.connect()
        console.log(`Tron consumer: connected`);

        for (const key of Object.keys(tronKafkaConfig.topic.consume)) {
            const topic = tronKafkaConfig.topic.consume[key]

            await tronConsumer.subscribe({ topic, fromBeginning: true })

            console.log(`subcribed topic: ${topic}`)
        }

        await tronConsumer.run({
            eachMessage: async (payload: EachMessagePayload) => {
                try {
                    const { topic, message } = payload

                    switch (topic) {
                        // case tronKafkaConfig.topic.consume.transaction:
                        //     await transactionConsumer(message)
                        //     break;
                        case tronKafkaConfig.topic.consume.contractevent:
                            await contracteventConsumer(message)
                            break;

                        default: throw new Error(`consumer for topic ${topic} not found`)
                    }
                } catch (e) {
                    throw e
                }
            }
        })
    } catch (e) {
        console.log(`Tron consumer not connected`);
        throw e
    }
}

export {
    tronConsumer,
    connectTronConsumer
}