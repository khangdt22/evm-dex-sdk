import type { Address, Hex } from 'viem'
import { slice } from 'viem'
import type { TransactionType } from '../constants'
import type { Transaction, TradeOptions, TransactionParams } from '../types'
import { InvalidTransactionError } from '../errors'
import { NativeToken } from '../entities'
import type { DexOptions } from './types'

export abstract class Dex {
    public readonly name: string
    public readonly nativeToken: NativeToken

    protected constructor(options: DexOptions) {
        this.name = options.name
        this.nativeToken = options.nativeToken
    }

    public abstract isTransactionInThisDex(transaction: Transaction): boolean

    public abstract getTransactionType(transaction: Transaction): TransactionType

    public abstract getApproveAddressForTrade(): Address

    public abstract parseTradeTransaction(transaction: Transaction): TradeOptions

    public abstract createTradeTransaction(options: TradeOptions): TransactionParams

    protected getSelector(data: Hex) {
        return slice(data, 0, 4, { strict: true })
    }

    protected getTransactionData<T extends boolean = true>(transaction: Transaction, throws?: T) {
        if (throws === undefined) {
            throws = true as T
        }

        const data = transaction.data ?? transaction.input ?? undefined

        if (!data && throws) {
            throw new InvalidTransactionError(transaction, 'missing data')
        }

        return data as T extends true ? Hex : Hex | undefined
    }
}
