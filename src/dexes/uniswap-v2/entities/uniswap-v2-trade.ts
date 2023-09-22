import type { Hex, Address } from 'viem'
import { encodeFunctionData, isAddressEqual } from 'viem'
import { Trade } from '../../../entities'
import { UNISWAP_V2_ROUTER } from '../../../abis'
import { TradeType } from '../../../constants'
import type { TradeOptions } from '../../../types'
import { getTokenAddress } from '../../../utils'

export class UniswapV2Trade extends Trade {
    public readonly path: Address[]

    public constructor(options: TradeOptions) {
        super(options)

        this.path = [getTokenAddress(options.input)]

        for (const [i, pair] of this.pairs.entries()) {
            this.path.push(isAddressEqual(this.path[i], pair.tokenA) ? pair.tokenA : pair.tokenB)
        }
    }

    public getTransactionData(): Hex {
        const name = this.getFunctionName()
        const args = this.getFunctionArgs()

        return encodeFunctionData({
            abi: UNISWAP_V2_ROUTER,
            functionName: name as any,
            args: args as any,
        })
    }

    public getTransactionValue() {
        return this.isNative(this.input) ? this.amountIn : 0n
    }

    protected getFunctionArgs() {
        if (this.tradeType === TradeType.EXACT_INPUT) {
            return this.getExactInputArgs()
        }

        return this.getExactOutputArgs()
    }

    protected getExactInputArgs() {
        const args = <const>[this.amountOut, this.path, this.recipient, this.deadline]

        if (this.isNative(this.input)) {
            return args
        }

        return <const>[this.amountIn, ...args]
    }

    protected getExactOutputArgs() {
        const args = <const>[this.path, this.recipient, this.deadline]

        if (this.isNative(this.input)) {
            return <const>[this.amountOut, ...args]
        }

        return <const>[this.amountOut, this.amountIn, ...args]
    }

    protected getFunctionName() {
        if (this.tradeType === TradeType.EXACT_INPUT) {
            return this.getExactInputFunctionName()
        }

        return this.getExactOutputFunctionName()
    }

    protected getExactInputFunctionName() {
        if (this.isNative(this.input)) {
            return this.useFeeOnTransfer ? 'swapExactETHForTokensSupportingFeeOnTransferTokens' : 'swapExactETHForTokens'
        }

        if (this.isNative(this.output)) {
            return this.useFeeOnTransfer ? 'swapExactTokensForETHSupportingFeeOnTransferTokens' : 'swapExactTokensForETH'
        }

        return this.useFeeOnTransfer ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens' : 'swapExactTokensForTokens'
    }

    protected getExactOutputFunctionName() {
        if (this.isNative(this.input)) {
            return this.useFeeOnTransfer ? 'swapETHForExactTokensSupportingFeeOnTransferTokens' : 'swapETHForExactTokens'
        }

        if (this.isNative(this.output)) {
            return this.useFeeOnTransfer ? 'swapTokensForExactETHSupportingFeeOnTransferTokens' : 'swapTokensForExactETH'
        }

        return this.useFeeOnTransfer ? 'swapTokensForExactTokensSupportingFeeOnTransferTokens' : 'swapTokensForExactTokens'
    }
}
