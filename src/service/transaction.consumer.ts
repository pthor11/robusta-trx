import { KafkaMessage } from "kafkajs";
import { coinProducer } from "../kafka/coin.kafka";
import { parseWatchAccount } from "../model/Account";
import { Change } from "../model/Change";
import { CurrencyType } from "../model/Currency";
import { getKeys } from "../redis";

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
    assetName: string | null, // 'trx' | id of trc10
    assetAmount: number,
    latestSolidifiedBlockNumber: number,
    internalTrananctionList: any[],
    data: string
}

const transactionConsumer = async (_message: KafkaMessage) => {
    try {
        const data: TxRaw = JSON.parse(_message.value?.toString() || '')

        const { triggerName, transactionId, blockNumber, timeStamp, fromAddress, toAddress, assetName, assetAmount } = data

        if (triggerName === 'transactionTrigger' && fromAddress && toAddress && assetAmount) {
            const [foundSenders, foundReceivers] = await Promise.all([
                getKeys(assetName === 'trx' ? `*.${fromAddress}.trx*` : `*.${fromAddress}.trc10.${assetName}`),
                getKeys(assetName === 'trx' ? `*.${toAddress}.trx*` : `*.${toAddress}.trc10.${assetName}`),
            ])

            for (const _sender of foundSenders) {
                const sender = parseWatchAccount(_sender)

                console.log({ sender });

                const change: Change = {
                    address: sender.address,
                    txid: transactionId,
                    n: 0,
                    value: String(assetAmount),
                    currency: {
                        type: assetName === CurrencyType.trx ? CurrencyType.trx : CurrencyType.trc10,
                        address: assetName === CurrencyType.trx ? null : assetName!
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
                    value: String(-assetAmount),
                    currency: {
                        type: assetName === CurrencyType.trx ? CurrencyType.trx : CurrencyType.trc10,
                        address: assetName === CurrencyType.trx ? null : assetName!
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

export { transactionConsumer }