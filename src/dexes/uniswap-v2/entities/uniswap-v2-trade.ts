import { parseUnits, type EncodeFunctionDataParameters } from 'viem'
import { Token, Trade } from '../../../entities'
import { TradeType } from '../../../constants'
import type { UniswapV2TradeOptions } from '../types'
import { toBigInt, percentOf, isNative } from '../../../utils'
import { UNISWAP_V2_ROUTER } from '../../../abis'

export class UniswapV2Trade extends Trade<UniswapV2TradeOptions> {
    public readonly wrappedInput: Token
    public readonly wrappedOutput: Token
    public readonly path: Token[]

    #inputAmount?: bigint
    #outputAmount?: bigint

    public constructor(protected readonly options: UniswapV2TradeOptions) {
        super(options)

        this.wrappedInput = options.input.wrapped
        this.wrappedOutput = options.output.wrapped
        this.path = [this.wrappedInput]

        for (const [i, pair] of this.pairs.entries()) {
            this.path.push(this.path[i].equals(pair.token0) ? pair.token1 : pair.token0)
        }
    }

    public get inputAmount() {
        return (this.#inputAmount ??= this.getInputAmount(this.options))
    }

    public get outputAmount() {
        return (this.#outputAmount ??= this.getOutputAmount(this.options))
    }

    public get minimumAmountOut() {
        return this.outputAmount - toBigInt(percentOf(this.outputAmount, this.slippage))
    }

    public get maximumAmountIn() {
        return this.inputAmount + toBigInt(percentOf(this.inputAmount, this.slippage))
    }

    public getEncodeParameters() {
        const abi = UNISWAP_V2_ROUTER
        const functionName = this.getFunctionName()
        const args = this.tradeType === TradeType.EXACT_INPUT ? this.getExactInputArgs() : this.getExactOutputArgs()

        return <EncodeFunctionDataParameters<typeof abi, typeof functionName>>{
            abi,
            functionName,
            args,
        }
    }

    public getTransactionValue() {
        if (isNative(this.input)) {
            if (this.tradeType === TradeType.EXACT_INPUT) {
                return this.inputAmount
            }

            return this.maximumAmountIn
        }

        return 0n
    }

    protected getExactInputArgs() {
        const args = <const>[this.minimumAmountOut, this.path.map((t) => t.address), this.recipient, this.deadline]

        if (isNative(this.input)) {
            return args
        }

        return <const>[this.inputAmount, ...args]
    }

    protected getExactOutputArgs() {
        const args = <const>[this.path.map((t) => t.address), this.recipient, this.deadline]

        if (isNative(this.input)) {
            return <const>[this.outputAmount, ...args]
        }

        return <const>[this.outputAmount, this.maximumAmountIn, ...args]
    }

    protected getFunctionName() {
        if (this.tradeType === TradeType.EXACT_INPUT) {
            return this.getExactInputFunctionName()
        }

        return this.getExactOutputFunctionName()
    }

    protected getExactInputFunctionName() {
        if (isNative(this.input)) {
            return this.useFeeOnTransfer ? 'swapExactETHForTokensSupportingFeeOnTransferTokens' : 'swapExactETHForTokens'
        }

        if (isNative(this.output)) {
            return this.useFeeOnTransfer ? 'swapExactTokensForETHSupportingFeeOnTransferTokens' : 'swapExactTokensForETH'
        }

        return this.useFeeOnTransfer ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens' : 'swapExactTokensForTokens'
    }

    protected getExactOutputFunctionName() {
        if (isNative(this.input)) {
            return this.useFeeOnTransfer ? 'swapETHForExactTokensSupportingFeeOnTransferTokens' : 'swapETHForExactTokens'
        }

        if (isNative(this.output)) {
            return this.useFeeOnTransfer ? 'swapTokensForExactETHSupportingFeeOnTransferTokens' : 'swapTokensForExactETH'
        }

        return this.useFeeOnTransfer ? 'swapTokensForExactTokensSupportingFeeOnTransferTokens' : 'swapTokensForExactTokens'
    }

    protected getInputAmount(options: UniswapV2TradeOptions) {
        if (options.type === TradeType.EXACT_INPUT) {
            return parseUnits(options.amountIn.toString(), this.wrappedInput.decimals)
        }

        const inputAmounts: bigint[] = [parseUnits(options.amountOut.toString(), this.wrappedOutput.decimals)]
        const path = [...this.path].reverse()

        for (const [i, pair] of [...this.pairs].reverse().entries()) {
            inputAmounts[i + 1] = pair.getAmountIn(path[i], inputAmounts[i])
        }

        return inputAmounts.at(-1)!
    }

    protected getOutputAmount(options: UniswapV2TradeOptions) {
        if (options.type === TradeType.EXACT_OUTPUT) {
            return parseUnits(options.amountOut.toString(), this.wrappedOutput.decimals)
        }

        const outputAmounts: bigint[] = [parseUnits(options.amountIn.toString(), this.wrappedInput.decimals)]

        for (const [i, pair] of this.pairs.entries()) {
            outputAmounts[i + 1] = pair.getAmountOut(this.path[i], outputAmounts[i])
        }

        return outputAmounts.at(-1)!
    }
}
