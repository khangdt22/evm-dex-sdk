import type { Address, PairInfo } from '../types'
import { Dex } from '../dexes'
import type { Token } from './token'

export abstract class Pair<TDex extends Dex = Dex> {
    public abstract readonly address: Address

    public readonly dex: TDex
    public readonly tokenA: Token
    public readonly tokenB: Token

    protected constructor({ dex, tokenA, tokenB }: PairInfo<TDex>) {
        this.dex = dex
        this.tokenA = tokenA
        this.tokenB = tokenB
    }

    public abstract involvesToken(token: Address | Token): boolean
}
