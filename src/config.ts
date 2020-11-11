import { config } from "dotenv";

config()

if (!process.env.REDIS_URI) throw new Error(`redis uri must be provided`)
export const redisUri = process.env.REDIS_URI

// if (!process.env.BLOCK_INIT) throw new Error(`block init must be provided`)
// export const blockInit = process.env.BLOCK_INIT

if (!process.env.TRON_KAFKA_CLIENT_ID) throw new Error(`Tron kafka client id must be provided`)
if (!process.env.TRON_KAFKA_GROUP_ID) throw new Error(`Tron kafka group id must be provided`)
if (!process.env.TRON_KAFKA_BROKERS) throw new Error(`Tron kafka brokers must be provided`)

export const tronKafkaConfig = {
    clientId: process.env.TRON_KAFKA_CLIENT_ID,
    groupId: process.env.TRON_KAFKA_GROUP_ID,
    brokers: process.env.TRON_KAFKA_BROKERS,
    topic: {
        consume: {
            // block: 'block',
            // transaction: 'transaction',
            contractevent: 'contractevent'
        },
        produce: {}
    }
}

// if (!process.env.COIN_KAFKA_CLIENT_ID) throw new Error(`coin kafka client id must be provided`)
// if (!process.env.COIN_KAFKA_GROUP_ID) throw new Error(`coin kafka group id must be provided`)
// if (!process.env.COIN_KAFKA_BROKERS) throw new Error(`coin kafka brokers must be provided`)

// export const coinKafkaConfig = {
//     clientId: process.env.COIN_KAFKA_CLIENT_ID,
//     groupId: process.env.COIN_KAFKA_GROUP_ID,
//     brokers: process.env.COIN_KAFKA_BROKERS,
//     topic: {
//         consume: {},
//         produce: {
//             change: 'change'
//         }
//     }
// }