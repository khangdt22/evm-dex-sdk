import type { Address } from 'viem'
import type { TradeType } from '../constants'
import { Currency } from '../entities'

export interface Pair {
    tokenA: Address
    tokenB: Address
    fee: number
}

export interface BaseTradeOptions {
    pairs: Pair[]
    input: Address | Currency
    output: Address | Currency
    recipient: Address
    deadline: number
    feeOnTransfer?: boolean
}

export interface ExactInputTradeOptions extends BaseTradeOptions {
    type: TradeType.EXACT_INPUT
    amountIn: bigint
    amountOutMin: bigint
}

export interface ExactOutputTradeOptions extends BaseTradeOptions {
    type: TradeType.EXACT_OUTPUT
    amountOut: bigint
    amountInMax: bigint
}

export type TradeOptions = ExactInputTradeOptions | ExactOutputTradeOptions
