import type { Address, Hex, Hash } from 'viem'

export interface Transaction {
    hash?: Hash
    to?: Address
    data?: Hex
    input?: Hex
    value?: bigint
}

export interface CreateTransactionResult {
    to: Address
    data: Hex
    value: bigint
}
