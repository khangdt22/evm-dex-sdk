import type { Numberish as BaseNumberish } from '@khangdt22/utils/number'
import type { FixedNumber } from '@ethersproject/bignumber'

export interface FormattedNumber {
    value: bigint
    formatted: string
    decimals: number
}

export type Numberish = BaseNumberish | FixedNumber

export type InputNumber = Numberish | FormattedNumber
