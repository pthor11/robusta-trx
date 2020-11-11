import { KafkaMessage } from "kafkajs";
import { coinProducer } from "../kafka/coin.kafka";
import { parseWatchAccount } from "../model/Account";
import { Change } from "../model/Change";
import { CurrencyType } from "../model/Currency";
import { getKeys } from "../redis";

type EventRaw = {
    timeStamp: number,
    triggerName: string, // 'contractEventTrigger'
    uniqueId: string,
    transactionId: string,
    contractAddress: string,
    callerAddress: string,
    originAddress: string,
    creatorAddress: string,
    blockNumber: number,
    removed: boolean,
    latestSolidifiedBlockNumber: number,
    logInfo: any | null,
    rawData: any,
    abi: any | null,
    eventSignature: string, // 'Transfer(address,address,uint256)'
    eventSignatureFull: string, // 'Transfer(address from,address to,uint256 value)'
    eventName: string, // 'Transfer'
    topicMap: {
        from?: string,
        to?: string
    },
    dataMap: {
        value?: string
    }
}

const contracteventConsumer = async (_message: KafkaMessage) => {
    try {
        const data: EventRaw = JSON.parse(_message.value?.toString() || '')

        // console.log({ data });

        const { triggerName, transactionId, blockNumber, timeStamp, eventName, eventSignature, eventSignatureFull, contractAddress, topicMap, dataMap } = data
        const { from, to } = topicMap
        const { value } = dataMap

        if (triggerName === 'contractEventTrigger' && eventName === 'Transfer' && eventSignature === 'Transfer(address,address,uint256)' && eventSignatureFull === 'Transfer(address from,address to,uint256 value)' && contractAddress && from && to && value) {

            const [foundSenders, foundReceivers] = await Promise.all([
                getKeys(`*.${from}.trc20.${contractAddress}`),
                getKeys(`*.${to}.trc20.${contractAddress}`)
            ])

            for (const _sender of foundSenders) {
                const sender = parseWatchAccount(_sender)

                console.log({ sender });

                const change: Change = {
                    address: sender.address,
                    txid: transactionId,
                    n: 0,
                    value,
                    currency: {
                        type: CurrencyType.trc20,
                        address: contractAddress
                    },
                    blockNumber,
                    timeStamp
                }

                console.log({ change })

                const recordSender = await coinProducer.send({
                    topic: sender.apiKey,
                    messages: [{ value: JSON.stringify(change) }]
                })

                console.log({ recordSender });
            }

            for (const _receiver of foundReceivers) {
                const receiver = parseWatchAccount(_receiver)

                console.log({ receiver });

                const change: Change = {
                    address: receiver.address,
                    txid: transactionId,
                    n: 0,
                    value: `-${value}`,
                    currency: {
                        type: CurrencyType.trc20,
                        address: contractAddress
                    },
                    blockNumber,
                    timeStamp
                }

                console.log({ change })

                const recordReceiver = await coinProducer.send({
                    topic: receiver.apiKey,
                    messages: [{ value: JSON.stringify(change) }]
                })

                console.log({ recordReceiver });
            }
        }
    } catch (e) {
        throw e
    }
}

export { contracteventConsumer }