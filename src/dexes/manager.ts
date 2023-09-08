import type { Transaction } from '../types'
import type { Dex } from './dex'

export class DexManager {
    public constructor(public readonly dexes: Dex[]) {}

    public getDexByTransaction(transaction: Transaction) {
        return this.dexes.find((dex) => dex.isTransactionInThisDex(transaction))
    }
}
