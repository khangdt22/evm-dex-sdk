import { FixedNumber } from '@ethersproject/bignumber'

export const ZERO = FixedNumber.from('0')

export const ONE_HUNDRED = FixedNumber.from('100')

export enum TradeType {
    EXACT_INPUT = 'EXACT_INPUT',
    EXACT_OUTPUT = 'EXACT_OUTPUT',
}

export enum TransactionType {
    ADD_LIQUIDITY = 'ADD_LIQUIDITY',
    REMOVE_LIQUIDITY = 'REMOVE_LIQUIDITY',
    TRADE = 'TRADE',
    UNKNOWN = 'UNKNOWN',
}
