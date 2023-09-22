import type { Address } from 'viem'
import { isAddressEqual } from 'viem'
import { Currency } from './currency'

export class Token extends Currency {
    public readonly isNative: boolean = false
    public readonly wrapped = this

    public constructor(public readonly address: Address, name: string, symbol: string, decimals: number) {
        super(name, symbol, decimals)

        this.address = address
    }

    public equals(other: Address | Currency) {
        if (other instanceof Currency) {
            return other instanceof Token && isAddressEqual(this.address, other.address)
        }

        return isAddressEqual(this.address, other)
    }

    public sortsBefore(other: Token) {
        return this.address.toLowerCase() < other.address.toLowerCase()
    }
}
