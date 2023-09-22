import type { Address, Hex } from 'viem'
import { TradeType } from '../constants'
import type { TradeOptions, ExactInputTradeOptions, Pair } from '../types'
import { Currency } from './currency'

export abstract class Trade {
    public readonly tradeType: TradeType

    public readonly pairs: Pair[]

    public readonly input: Address | Currency

    public readonly output: Address | Currency

    public readonly recipient: Address

    public readonly deadline: number

    public readonly useFeeOnTransfer: boolean

    public readonly amountIn: bigint

    public readonly amountOut: bigint

    protected constructor(options: TradeOptions) {
        this.tradeType = options.type
        this.pairs = options.pairs
        this.input = options.input
        this.output = options.output
        this.recipient = options.recipient
        this.deadline = options.deadline
        this.useFeeOnTransfer = !!options.feeOnTransfer
        this.amountIn = this.getAmountIn(options)
        this.amountOut = this.getAmountOut(options)
    }

    public abstract getTransactionData(): Hex

    public abstract getTransactionValue(): bigint

    protected getAmountIn(options: TradeOptions) {
        return this.isExactInput(options) ? options.amountIn : options.amountInMax
    }

    protected getAmountOut(options: TradeOptions) {
        return this.isExactInput(options) ? options.amountOutMin : options.amountOut
    }

    protected isExactInput(options: TradeOptions): options is ExactInputTradeOptions {
        return options.type === TradeType.EXACT_INPUT
    }

    protected isNative(currency: Address | Currency): currency is Currency {
        return currency instanceof Currency && currency.isNative
    }
}
