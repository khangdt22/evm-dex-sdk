import { EventEmitter } from 'node:events'
import type { Log } from 'viem'
import type { TradeOptions, CreateTransactionResult, DexOptions, ParsedAddLpTransaction, ParsedTradeTransaction, PairInfo, Hex, Transaction, EventFilter, Address } from '../types'
import type { NativeToken } from '../entities'
import { Pair } from '../entities'
import type { TransactionType } from '../constants'

export abstract class Dex<TPairData = unknown> extends EventEmitter {
    public readonly name: string
    public readonly nativeToken: NativeToken

    protected constructor(options: DexOptions) {
        super()

        this.name = options.name
        this.nativeToken = options.nativeToken
    }

    public abstract isTransactionInThisDex(transaction: Transaction): boolean

    public abstract getTransactionType(transaction: Transaction): TransactionType | undefined

    public abstract getApproveAddressForTrade(): Address

    public abstract parseAddLiquidityTransaction(transaction: Transaction): ParsedAddLpTransaction

    public abstract parseTradeTransaction(transaction: Transaction): ParsedTradeTransaction

    public abstract createTradeTransaction(options: TradeOptions): CreateTransactionResult

    public abstract createGetPairDataTransaction(pairInfo: PairInfo): CreateTransactionResult

    public abstract parseGetPairDataResult(info: PairInfo, callResult: Hex): TPairData

    public abstract createPair(info: PairInfo, data: TPairData): Pair

    public abstract createUpdatePairsEventFilter(pairs: Pair[]): EventFilter

    public abstract updatePairsByLogs(pairs: Pair[], logs: Log[]): Pair[]
}
