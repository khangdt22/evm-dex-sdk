import type { EncodeFunctionDataParameters } from 'viem'
import type { TradeOptions, Address } from '../types'
import type { TradeType } from '../constants'

export abstract class Trade<TOptions extends TradeOptions> {
    public readonly tradeType: TradeType
    public readonly pairs: TOptions['pairs']
    public readonly input: TOptions['input']
    public readonly output: TOptions['output']
    public readonly recipient: Address
    public readonly slippage: number
    public readonly deadline: number
    public readonly useFeeOnTransfer: boolean

    protected constructor(options: TOptions) {
        this.tradeType = options.type
        this.pairs = options.pairs
        this.input = options.input
        this.output = options.output
        this.recipient = options.recipient
        this.slippage = options.slippage
        this.deadline = options.deadline
        this.useFeeOnTransfer = !!options.feeOnTransfer
    }

    public abstract getEncodeParameters(): EncodeFunctionDataParameters

    public abstract getTransactionValue(): bigint
}
