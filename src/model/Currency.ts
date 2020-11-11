type Currency = {
    type: string
    address: string | null
}

const CurrencyType = {
    btc: 'btc',
    bch: 'bch',
    ltc: 'ltc',
    eth: 'eth',
    etc: 'etc',
    trx: 'trx',
    erc20: 'erc20',
    trc10: 'trc10',
    trc20: 'trc20'
}

const CurrencyTypes = Object.keys(CurrencyType)

export {
    Currency,
    CurrencyType,
    CurrencyTypes
}