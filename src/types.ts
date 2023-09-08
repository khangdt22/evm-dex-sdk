import type { Numberish as BaseNumberish } from '@khangdt22/utils/number'
import type { FixedNumber } from '@ethersproject/bignumber'
import type { Transaction as BaseTransaction } from 'viem'
import { watchEvent } from 'viem/actions'
import type { NativeToken, Pair, Currency } from './entities'
import { Token } from './entities'
import type { TradeType } from './constants'
import type { Dex } from './dexes'

export type Hex = `0x${string}`

export type Address = `0x${string}`

export type Numberish = BaseNumberish | FixedNumber

export type Transaction = BaseTransaction

export interface CreateTransactionResult {
    to: Address
    data: Hex
    value: bigint
}

export interface DexOptions {
    name: string
    nativeToken: NativeToken
}

export interface PairInfo<TDex extends Dex = Dex, TCurrency = Token> {
    dex: TDex
    tokenA: TCurrency
    tokenB: TCurrency
    fee: number
}

export interface BaseTradeOptions<TPair, TCurrency> {
    pairs: TPair[]
    input: TCurrency
    output: TCurrency
    recipient: Address
    slippage: number
    deadline: number
    feeOnTransfer?: boolean
}

export interface ExactInputTradeOptions<TPair, TCurrency> extends BaseTradeOptions<TPair, TCurrency> {
    type: TradeType.EXACT_INPUT
    amountIn: Numberish
}

export interface ExactOutputTradeOptions<TPair, TCurrency> extends BaseTradeOptions<TPair, TCurrency> {
    type: TradeType.EXACT_OUTPUT
    amountOut: Numberish
}

export type TradeOptions<TPair = Pair, TCurrency = Currency> =
    ExactInputTradeOptions<TPair, TCurrency> |
    ExactOutputTradeOptions<TPair, TCurrency>

export interface ParsedAddLpTransaction {
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

export type ParsedTradeTransactionBase = Omit<TradeOptions<PairInfo<Dex, Address>, Address>, 'slippage'> & {
    path: Address[]
}

export interface ParsedExactInputTradeTransaction extends ParsedTradeTransactionBase {
    type: TradeType.EXACT_INPUT
    amountIn: bigint
    amountOutMin: bigint
}

export interface ParsedExactOutputTradeTransaction extends ParsedTradeTransactionBase {
    type: TradeType.EXACT_INPUT
    amountOut: bigint
    amountInMax: bigint
}

export type ParsedTradeTransaction = ParsedExactInputTradeTransaction | ParsedExactOutputTradeTransaction

export type EventFilter = Pick<Parameters<typeof watchEvent>[1], 'address' | 'event' | 'events' | 'args'>
