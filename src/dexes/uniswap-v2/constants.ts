import type { Hex } from 'viem'
import { TransactionType } from '../../constants'

export const ADD_LIQUIDITY_SELECTORS: Hex[] = [
    '0xe8e33700', // addLiquidity
    '0xf305d719', // addLiquidityETH
]

export const REMOVE_LIQUIDITY_SELECTORS: Hex[] = [
    '0xbaa2abde', // removeLiquidity
    '0x02751cec', // removeLiquidityETH
    '0x2195995c', // removeLiquidityWithPermit
    '0xded9382a', // removeLiquidityETHWithPermit
    '0xaf2979eb', // removeLiquidityETHSupportingFeeOnTransferTokens
    '0x5b0d5984', // removeLiquidityETHWithPermitSupportingFeeOnTransferTokens
]

export const TRADE_SELECTORS: Hex[] = [
    '0x38ed1739', // swapExactTokensForTokens
    '0x8803dbee', // swapTokensForExactTokens
    '0x7ff36ab5', // swapExactETHForTokens
    '0x4a25d94a', // swapTokensForExactETH
    '0x18cbafe5', // swapExactTokensForETH
    '0xfb3bdb41', // swapETHForExactTokens
    '0x5c11d795', // swapExactTokensForTokensSupportingFeeOnTransferTokens
    '0xb6f9de95', // swapExactETHForTokensSupportingFeeOnTransferTokens
    '0x791ac947', // swapExactTokensForETHSupportingFeeOnTransferTokens
]

export const TRANSACTION_TYPE_BY_SELECTOR = {
    ...Object.fromEntries(ADD_LIQUIDITY_SELECTORS.map((s) => [s, TransactionType.ADD_LIQUIDITY])),
    ...Object.fromEntries(REMOVE_LIQUIDITY_SELECTORS.map((s) => [s, TransactionType.REMOVE_LIQUIDITY])),
    ...Object.fromEntries(TRADE_SELECTORS.map((s) => [s, TransactionType.TRADE])),
}

export const EXACT_INPUT_TRADE_FUNCTION_NAMES = <const>[
    'swapExactTokensForTokens',
    'swapExactETHForTokens',
    'swapExactTokensForETH',
    'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    'swapExactETHForTokensSupportingFeeOnTransferTokens',
    'swapExactTokensForETHSupportingFeeOnTransferTokens',
]

export const EXACT_OUTPUT_TRADE_FUNCTION_NAMES = <const>[
    'swapTokensForExactTokens',
    'swapTokensForExactETH',
    'swapETHForExactTokens',
]

export const TRADE_FUNCTION_NAMES = <const>[...EXACT_INPUT_TRADE_FUNCTION_NAMES, ...EXACT_OUTPUT_TRADE_FUNCTION_NAMES]
