import type { Address } from 'viem'
import type { NativeToken } from '../entities'
import type { TradeOptions, PairData } from '../types'
import type { TradeType } from '../constants'

export interface DexOptions {
    name: string
    nativeToken: NativeToken
}

export interface AddLiquidityData {
    tokenA: Address
    tokenB: Address
    pairFee: number
    amountADesired: bigint
    amountBDesired: bigint
    amountAMin: bigint
    amountBMin: bigint
    recipient: Address
    deadline: number
}

export type BaseTradeData = Omit<TradeOptions<PairData<Address>, Address>, 'slippage'> & {
    path: Address[]
}

export interface ExactInputTradeData extends BaseTradeData {
    type: TradeType.EXACT_INPUT
    amountIn: bigint
    amountOutMin: bigint
}

export interface ExactOutputTradeData extends BaseTradeData {
    type: TradeType.EXACT_INPUT
    amountOut: bigint
    amountInMax: bigint
}

export type TradeData = ExactInputTradeData | ExactOutputTradeData
