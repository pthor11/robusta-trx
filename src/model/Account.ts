import { Currency } from "./Currency";

type WatchAccount = {
    apiKey: string
    address: string
    currency: Currency
}

const parseWatchAccount = (_string: string): WatchAccount => {
    try {
        const [apiKey, address, currencyType, currencyAddress] = _string.split('.')

        const currency = {
            type: currencyType,
            address: currencyAddress
        }

        return { apiKey, address, currency }
    } catch (e) {
        throw e
    }
}

const stringifyWatchAccount = (_account: WatchAccount): string => `${_account.apiKey}.${_account.address}.${_account.currency.type}.${_account.currency.address}`

export {
    WatchAccount,
    parseWatchAccount,
    stringifyWatchAccount
}