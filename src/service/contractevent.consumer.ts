import { KafkaMessage } from "kafkajs";
import { getAsync } from "../redis";

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

        const { triggerName, eventName, eventSignature, eventSignatureFull, contractAddress, topicMap, dataMap } = data
        const { from, to } = topicMap
        const { value } = dataMap

        if (triggerName === 'contractEventTrigger' && eventName === 'Transfer' && eventSignature === 'Transfer(address,address,uint256)' && eventSignatureFull === 'Transfer(address from,address to,uint256 value)' && contractAddress && from && to && value) {

            const [foundSender, foundReceiver] = await Promise.all([
                getAsync(`${from}.trc20.${contractAddress}`),
                getAsync(`${to}.trc20.${contractAddress}`)
            ])

            if (foundSender !== null) console.log({ from, contractAddress, value, txid: data.transactionId, blockNumber: data.blockNumber })

            if (foundReceiver !== null) console.log({ to, contractAddress, value, txid: data.transactionId, blockNumber: data.blockNumber })
        }
    } catch (e) {
        throw e
    }
}

export { contracteventConsumer }