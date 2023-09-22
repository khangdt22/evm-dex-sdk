import type { Address } from 'viem'
import { isAddressEqual } from 'viem'
import { Dex } from '../dex'
import type { TradeOptions, TransactionParams, Transaction } from '../../types'
import { TransactionType } from '../../constants'
import type { UniswapV2Options } from './types'
import { TRANSACTION_TYPE_BY_SELECTOR } from './constants'
import { UniswapV2Trade } from './entities'
import { parseUniswapV2TradeTransaction } from './parsers'

export class UniswapV2 extends Dex {
    public readonly router: Address
    public readonly factory: Address
    public readonly fee: number

    public constructor(options: UniswapV2Options) {
        super(options)

        this.router = options.router
        this.factory = options.factory
        this.fee = options.fee
    }

    public isTransactionInThisDex(transaction: Transaction) {
        if (!transaction.to) {
            return false
        }

        return isAddressEqual(transaction.to, this.router) || isAddressEqual(transaction.to, this.factory)
    }

    public getTransactionType(transaction: Transaction) {
        const data = this.getTransactionData(transaction, false)

        if (!data || data.length < 10) {
            return TransactionType.UNKNOWN
        }

        return TRANSACTION_TYPE_BY_SELECTOR[this.getSelector(data)] ?? TransactionType.UNKNOWN
    }

    public getApproveAddressForTrade() {
        return this.router
    }

    public parseTradeTransaction(transaction: Transaction) {
        return parseUniswapV2TradeTransaction.call(this, transaction)
    }

    public createTradeTransaction(options: TradeOptions): TransactionParams {
        const trade = new UniswapV2Trade(options)
        const data = trade.getTransactionData()
        const value = trade.getTransactionValue()

        return { data, value, to: this.router }
    }
}
