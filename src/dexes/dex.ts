/* eslint-disable max-len */

import { EventEmitter } from 'node:events'
import type { Log, Address, Hex } from 'viem'
import type { NativeToken, Pair, Currency } from '../entities'
import type { TransactionType } from '../constants'
import type { Transaction, TradeOptions, CreateTransactionResult, EventFilter, PairData } from '../types'
import { InvalidTransactionError } from '../errors'
import type { DexOptions, AddLiquidityData, TradeData } from './types'

export abstract class Dex<TCurrency extends Currency = Currency, TPair extends Pair<TCurrency> = Pair<TCurrency>, TPairMetadata = unknown> extends EventEmitter {
    public readonly name: string
    public readonly nativeToken: NativeToken

    protected constructor(options: DexOptions) {
        super()

        this.name = options.name
        this.nativeToken = options.nativeToken
    }

    public abstract isTransactionInThisDex(transaction: Transaction): boolean

    public abstract getTransactionType(transaction: Transaction): TransactionType

    public abstract getApproveAddressForTrade(): Address

    public abstract parseAddLiquidityTransaction(transaction: Transaction): AddLiquidityData

    public abstract parseTradeTransaction(transaction: Transaction): TradeData

    public abstract parseGetPairMetadataResult(data: PairData<TCurrency>, callResult: Hex): TPairMetadata

    public abstract createTradeTransaction(options: TradeOptions<TPair, TCurrency>): CreateTransactionResult

    public abstract createGetPairMetadataTransaction(pairData: PairData<TCurrency>): CreateTransactionResult

    public abstract createPair(data: PairData<TCurrency>, metadata: TPairMetadata): TPair

    public abstract createUpdatePairsEventFilter(pairs: TPair[]): EventFilter

    public abstract updatePairsByLogs(pairs: TPair[], logs: Log[]): TPair[]

    protected getTransactionData(transaction: Transaction) {
        const data = transaction.data ?? transaction.input

        if (!data) {
            throw new InvalidTransactionError(transaction, 'missing data')
        }

        return data
    }
}
