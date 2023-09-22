import { decodeFunctionData, type Address } from 'viem'
import type { Transaction, TradeOptions, ExactInputTradeOptions, ExactOutputTradeOptions, Pair } from '../../../types'
import { UNISWAP_V2_ROUTER, UNISWAP_V2_ROUTER_EXACT_INPUT_SWAP, UNISWAP_V2_ROUTER_EXACT_OUTPUT_SWAP } from '../../../abis'
import { TRADE_FUNCTION_NAMES, EXACT_INPUT_TRADE_FUNCTION_NAMES, EXACT_OUTPUT_TRADE_FUNCTION_NAMES } from '../constants'
import type { UniswapV2 } from '../uniswap-v2'
import { InvalidTransactionError } from '../../../errors'
import { TradeType } from '../../../constants'

type ExactInputDecodeResult = ReturnType<typeof decodeFunctionData<typeof UNISWAP_V2_ROUTER_EXACT_INPUT_SWAP>>

type ExactOutputDecodeResult = ReturnType<typeof decodeFunctionData<typeof UNISWAP_V2_ROUTER_EXACT_OUTPUT_SWAP>>

function isTradeFunction(input: any): input is typeof TRADE_FUNCTION_NAMES[number] {
    return TRADE_FUNCTION_NAMES.includes(input)
}

function isExactInputTrade(decoded: any): decoded is ExactInputDecodeResult {
    return EXACT_INPUT_TRADE_FUNCTION_NAMES.includes(decoded.functionName)
}

function isExactOutputTrade(decoded: any): decoded is ExactOutputDecodeResult {
    return EXACT_OUTPUT_TRADE_FUNCTION_NAMES.includes(decoded.functionName)
}

function pathToPairs(this: UniswapV2, path: readonly Address[]) {
    const pairs: Pair[] = []

    for (let i = 0; i < path.length - 1; i++) {
        pairs.push({ tokenA: path[i], tokenB: path[i + 1], fee: this.fee })
    }

    return pairs
}

function parseExactInput(this: UniswapV2, decoded: ExactInputDecodeResult, value: bigint): ExactInputTradeOptions {
    const { functionName, args } = decoded

    let params: readonly [bigint, bigint, readonly Address[], Address, bigint]

    // eslint-disable-next-line unicorn/prefer-ternary
    if (functionName == 'swapExactETHForTokens' || functionName == 'swapExactETHForTokensSupportingFeeOnTransferTokens') {
        params = [value, ...args]
    } else {
        params = args
    }

    return {
        type: TradeType.EXACT_INPUT,
        amountIn: params[0],
        amountOutMin: params[1],
        pairs: pathToPairs.call(this, params[2]),
        recipient: params[3],
        deadline: Number(params[4]),
        feeOnTransfer: functionName.endsWith('SupportingFeeOnTransferTokens'),
        input: functionName.startsWith('swapExactETH') ? this.nativeToken : params[2][0],
        output: functionName.includes('ForETH') ? this.nativeToken : params[2].at(-1)!,
    }
}

function parseExactOutput(this: UniswapV2, decoded: ExactOutputDecodeResult, value: bigint): ExactOutputTradeOptions {
    const { functionName, args } = decoded

    let amountOut: bigint
    let amountInMax: bigint
    let params: [readonly Address[], Address, bigint]

    if (functionName == 'swapETHForExactTokens') {
        amountOut = args[0]
        amountInMax = value
        params = [args[1], args[2], args[3]]
    } else {
        amountOut = args[0]
        amountInMax = args[1]
        params = [args[2], args[3], args[4]]
    }

    return {
        type: TradeType.EXACT_OUTPUT,
        amountOut,
        amountInMax,
        pairs: pathToPairs.call(this, params[0]),
        recipient: params[1],
        deadline: Number(params[2]),
        feeOnTransfer: false,
        input: functionName.startsWith('swapETH') ? this.nativeToken : params[0][0],
        output: functionName.endsWith('ForExactETH') ? this.nativeToken : params[0].at(-1)!,
    }
}

export function parseUniswapV2TradeTransaction(this: UniswapV2, transaction: Transaction): TradeOptions {
    const data = this.getTransactionData(transaction)
    const decoded = decodeFunctionData({ abi: UNISWAP_V2_ROUTER, data })

    if (!isTradeFunction(decoded.functionName) || !decoded.args) {
        throw new InvalidTransactionError(transaction, 'Not a trade transaction')
    }

    if (isExactInputTrade(decoded)) {
        return parseExactInput.call(this, decoded, transaction.value ?? 0n)
    }

    if (isExactOutputTrade(decoded)) {
        return parseExactOutput.call(this, decoded, transaction.value ?? 0n)
    }

    throw new InvalidTransactionError(transaction, 'Unable to decode transaction data')
}
