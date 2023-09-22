import type { Address } from 'viem'
import type { NativeToken } from '../entities'
import type { TradeOptions, ExactInputTradeOptions, ExactOutputTradeOptions } from '../types'

export interface DexOptions {
    name: string
    nativeToken: NativeToken
}

export type ExactInputTradeParams = ExactInputTradeOptions & {
    path: Address[] | readonly Address[]
}

export type ExactOutputTradeParams = ExactOutputTradeOptions & {
    path: Address[] | readonly Address[]
}

export type TradeParams = TradeOptions & {
    path: Address[] | readonly Address[]
}
