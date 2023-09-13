import type { Address } from 'viem'
import type { FormattedNumber, PairData, InputNumber } from '../types'
import type { Token } from './token'
import type { Currency } from './currency'

export abstract class Pair<TCurrency extends Currency = Token> {
    public abstract readonly address: Address

    public readonly tokenA: TCurrency
    public readonly tokenB: TCurrency

    protected constructor({ tokenA, tokenB }: PairData<TCurrency>) {
        this.tokenA = tokenA
        this.tokenB = tokenB
    }

    public abstract involves(currency: TCurrency): boolean

    public abstract getAmountOut(tokenIn: TCurrency, amountIn: InputNumber): FormattedNumber

    public abstract getAmountIn(tokenOut: TCurrency, amountOut: InputNumber): FormattedNumber

    public abstract priceOf(token: TCurrency): FormattedNumber
}
