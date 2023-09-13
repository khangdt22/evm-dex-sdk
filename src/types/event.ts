import type { Address } from 'viem'
import type { AbiEvent } from 'abitype'

export interface EventFilter {
    address?: Address | Address[]
    event?: AbiEvent
}
