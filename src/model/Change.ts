import { Currency } from "./Currency"

type Change = {
    address: string
    txid: string
    n: number
    value: string
    currency: Currency
    blockNumber: number
    timeStamp: number
}

export { Change }