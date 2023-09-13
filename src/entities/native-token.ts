import { Currency } from './currency'
import type { Token } from './token'

export interface NativeTokenData {
    name: string
    symbol: string
    decimals: number
    wrapped: Token
}

export class NativeToken extends Currency {
    public readonly wrapped: Token

    public constructor({ name, symbol, decimals, wrapped }: NativeTokenData) {
        super(name, symbol, decimals)

        this.wrapped = wrapped
    }

    public equals(other: Currency) {
        return other instanceof NativeToken
    }
}
