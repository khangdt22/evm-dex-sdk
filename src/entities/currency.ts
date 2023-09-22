import { formatUnits, parseUnits } from 'viem'
import type { Numberish } from '@khangdt22/utils/number'
import type { Token } from './token'

export abstract class Currency {
    public abstract readonly isNative: boolean
    public abstract readonly wrapped: Token

    public readonly name: string
    public readonly symbol: string
    public readonly decimals: number

    protected constructor(name: string, symbol: string, decimals: number) {
        this.name = name
        this.symbol = symbol
        this.decimals = decimals
    }

    public abstract equals(currency: Currency): boolean

    public formatAmount(amount: bigint) {
        return formatUnits(amount, this.decimals)
    }

    public parseAmount(amount: Numberish) {
        return parseUnits(amount.toString(), this.decimals)
    }
}
