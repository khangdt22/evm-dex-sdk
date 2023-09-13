/* eslint-disable max-len */

import type { Address } from 'viem'
import type { Pair, Currency } from '../entities'
import type { TradeType } from '../constants'
import type { InputNumber } from './number'

export interface BaseTradeOptions<TPair = Pair, TCurrency = Currency> {
    pairs: TPair[]
    input: TCurrency
    output: TCurrency
    recipient: Address
    slippage: number
    deadline: number
    feeOnTransfer?: boolean
}

export interface ExactInputTradeOptions<TPair = Pair, TCurrency = Currency> extends BaseTradeOptions<TPair, TCurrency> {
    type: TradeType.EXACT_INPUT
    amountIn: InputNumber
}

export interface ExactOutputTradeOptions<TPair = Pair, TCurrency = Currency> extends BaseTradeOptions<TPair, TCurrency> {
    type: TradeType.EXACT_OUTPUT
    amountOut: InputNumber
}

export type TradeOptions<TPair = Pair, TCurrency = Currency> = ExactInputTradeOptions<TPair, TCurrency> | ExactOutputTradeOptions<TPair, TCurrency>
