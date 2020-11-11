import { KafkaMessage } from "kafkajs";
import { coinProducer } from "../kafka/coin.kafka";
import { getAsync } from "../redis";

type TxRaw = {
    timeStamp: number,
    triggerName: string, // 'transactionTrigger'
    transactionId: string,
    blockHash: string,
    blockNumber: number,
    energyUsage: number,
    energyFee: number,
    originEnergyUsage: number,
    energyUsageTotal: number,
    netUsage: number,
    netFee: number,
    result: string,
    contractAddress: string | null,
    contractType: string,
    feeLimit: number,
    contractCallValue: number,
    contractResult: string | null,
    fromAddress: string | null,
    toAddress: string | null,
    assetName: string | null,
    assetAmount: number,
    latestSolidifiedBlockNumber: number,
    internalTrananctionList: any[],
    data: string
}

const transactionConsumer = async (_message: KafkaMessage) => {
    try {
        const data: TxRaw = JSON.parse(_message.value?.toString() || '')

        const { triggerName, fromAddress, toAddress, assetName, assetAmount } = data

        if (triggerName === 'transactionTrigger' && fromAddress && toAddress && assetName && assetAmount) {
            const [foundSender, foundReceiver] = await Promise.all([
                getAsync(`${fromAddress}.trc10.${assetName}`),
                getAsync(`${toAddress}.trc10.${assetName}`),
            ])

            if (foundSender !== null) {
                console.log({ fromAddress, assetName, assetAmount, txid: data.transactionId, blockNumber: data.blockNumber, blockHash: data.blockHash })
                const recordSender = await coinProducer.send({
                    topic: `${fromAddress}.trc10.${assetName}`,
                    messages: [{ value: JSON.stringify({ fromAddress, assetName, assetAmount, txid: data.transactionId, blockNumber: data.blockNumber, blockHash: data.blockHash }) }]
                })

                console.log({ recordSender });
            }

            if (foundReceiver !== null) {
                console.log({ toAddress, assetName, assetAmount, txid: data.transactionId, blockNumber: data.blockNumber, blockHash: data.blockHash })

                const recordReceiver = await coinProducer.send({
                    topic: `${toAddress}.trc10.${assetName}`,
                    messages: [{ value: JSON.stringify({ toAddress, assetName, assetAmount, txid: data.transactionId, blockNumber: data.blockNumber, blockHash: data.blockHash }) }]
                })

                console.log({ recordReceiver });
            }
        }
    } catch (e) {
        throw e
    }
}

export { transactionConsumer }