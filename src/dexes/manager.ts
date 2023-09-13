import type { Transaction } from '../types'
import type { Dex } from './dex'

export class DexManager {
    public readonly dexes = new Map<string, Dex>()

    public constructor(dexes: Dex[]) {
        for (const dex of dexes) {
            this.dexes.set(dex.name, dex)
        }
    }

    public findByName(name: string) {
        return this.dexes.get(name)
    }

    public findByTransaction(transaction: Transaction) {
        return [...this.dexes.values()].find((dex) => dex.isTransactionInThisDex(transaction))
    }
}
