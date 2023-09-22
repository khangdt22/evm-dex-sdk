import type { NativeTokenData } from '../types'
import { Currency } from './currency'
import type { Token } from './token'

export class NativeToken extends Currency {
    public readonly isNative: boolean = true
    public readonly wrapped: Token

    public constructor({ name, symbol, decimals, wrapped }: NativeTokenData) {
        super(name, symbol, decimals)

        this.wrapped = wrapped
    }

    public equals(other: Currency) {
        return other instanceof NativeToken
    }
}
