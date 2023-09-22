import type { Address, Hex, Hash } from 'viem'

export interface Transaction {
    hash?: Hash | null
    to?: Address | null
    data?: Hex | null
    input?: Hex | null
    value?: bigint | null
}

export interface TransactionParams {
    to: Address
    data: Hex
    value: bigint
}
