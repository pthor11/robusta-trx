import { KafkaMessage } from "kafkajs";
import { getAsync } from "../redis";

type TxRaw = {
    timeStamp: number,
    triggerName: string,
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

        const { fromAddress, toAddress, assetName, assetAmount } = data

        if (fromAddress && toAddress && assetName && assetAmount) {
            const [foundSender, foundReceiver] = await Promise.all([
                getAsync(`${data.fromAddress}.trc10.${data.assetName}`),
                getAsync(`${data.toAddress}.trc10.${data.assetName}`),
            ])

            if (foundSender) console.log({ fromAddress, assetName, assetAmount, txid: data.transactionId, blockNumber: data.blockNumber, blockHash: data.blockHash })

            if (foundReceiver) console.log({ toAddress, assetName, assetAmount, txid: data.transactionId, blockNumber: data.blockNumber, blockHash: data.blockHash })
        }
    } catch (e) {
        throw e
    }
}

export { transactionConsumer }