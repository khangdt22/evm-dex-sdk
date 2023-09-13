import type { Address, Hex } from 'viem'
import type { TradeType } from '../constants'
import type { TradeOptions } from '../types'
import type { Pair } from './pair'
import type { Currency } from './currency'

export abstract class Trade<TCurrency extends Currency = Currency, TPair extends Pair<TCurrency> = Pair<TCurrency>> {
    public readonly tradeType: TradeType

    public readonly pairs: TPair[]

    public readonly input: TCurrency

    public readonly output: TCurrency

    public readonly recipient: Address

    public readonly slippage: number

    public readonly deadline: number

    public readonly useFeeOnTransfer: boolean

    protected constructor(options: TradeOptions<TPair, TCurrency>) {
        this.tradeType = options.type
        this.pairs = options.pairs
        this.input = options.input
        this.output = options.output
        this.recipient = options.recipient
        this.slippage = options.slippage
        this.deadline = options.deadline
        this.useFeeOnTransfer = !!options.feeOnTransfer
    }

    public abstract getTransactionData(): Hex

    public abstract getTransactionValue(): bigint
}
