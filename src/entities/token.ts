import { isAddressEqual } from 'viem'
import type { Address } from '../types'
import { Currency } from './currency'

export class Token extends Currency {
    public constructor(public readonly address: Address, name: string, symbol: string, decimals: number) {
        super(name, symbol, decimals)

        this.address = address
    }

    public get wrapped() {
        return this
    }

    public equals(other: Currency) {
        return other instanceof Token && isAddressEqual(this.address, other.address)
    }

    public sortsBefore(other: Token) {
        return this.address.toLowerCase() < other.address.toLowerCase()
    }
}
