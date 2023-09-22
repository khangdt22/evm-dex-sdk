import type { Address } from 'viem'
import { Currency } from '../entities'

export function getTokenAddress(token: Address | Currency) {
    if (token instanceof Currency) {
        return token.wrapped.address
    }

    return token
}
