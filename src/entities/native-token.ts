import { Currency } from './currency'
import type { Token } from './token'

export class NativeToken extends Currency {
    public constructor(name: string, symbol: string, decimals: number, public readonly wrapped: Token) {
        super(name, symbol, decimals)
    }

    public equals(other: Currency) {
        return other instanceof NativeToken
    }
}
