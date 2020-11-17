import { KafkaMessage } from "kafkajs";
import { stringifyWatchAccount, WatchAccount } from "../model/Account";
import { CurrencyType, CurrencyTypes } from "../model/Currency";
import { delAsync, setAsync } from "../redis";


const trxConsumer = async (_message: KafkaMessage) => {
    try {
        const { apiKey, address, currency, watch } = JSON.parse(_message.value?.toString() || '')

        if (!apiKey) throw new Error(`watch consumer: api key must be provided`)

        if (!address) throw new Error(`watch consumer: address must be provided`)
        // check address is valid

        if (!CurrencyTypes.includes(currency.type)) throw new Error(`watch consumer: currency type invalid, must be one of ${CurrencyTypes}`)

        if ([CurrencyType.trc10, CurrencyType.trc20, CurrencyType.erc20].includes(currency.type) && !currency.address) throw new Error(`watch consumer: currency address must be provided for type ${currency.type}`)

        // check currency.address valid for currency type. example: address checksum for trc20, number for trc10 v..v..

        const account = stringifyWatchAccount({ apiKey, address, currency })

        if (watch === true) {
            await setAsync(account, '')
            console.log(`account ${account} inserted`);
        } else {
            await delAsync([account])
            console.log(`account ${account} removed`);
        }
    } catch (e) {
        throw e
    }
}

export { trxConsumer }