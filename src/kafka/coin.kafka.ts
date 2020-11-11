import { EachMessagePayload, Kafka } from "kafkajs";
import { coinKafkaConfig } from "../config";
import { transactionConsumer } from "../service/transaction.consumer";
import { contracteventConsumer } from "../service/contractevent.consumer";

const coinKafka = new Kafka({
    clientId: coinKafkaConfig.clientId,
    brokers: coinKafkaConfig.brokers.split(',') || []
})

// const coinConsumer = tronKafka.consumer({ groupId: coinKafkaConfig.groupId })
const coinProducer = coinKafka.producer({ allowAutoTopicCreation: true })

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