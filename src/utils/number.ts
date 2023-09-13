import { FixedNumber } from '@ethersproject/bignumber'
import { isObject } from '@khangdt22/utils/object'
import { formatUnits } from 'viem'
import type { Numberish, FormattedNumber } from '../types'

export function isFormattedNumber(value: unknown): value is FormattedNumber {
    return isObject(value) && 'value' in value && 'formatted' in value && 'decimals' in value
}

export function toFormattedNumber(value: bigint, decimals: number): FormattedNumber {
    return { value, decimals, formatted: formatUnits(value, decimals) }
}

export function toFixedNumber(value: Numberish) {
    if (value instanceof FixedNumber) {
        return value
    }

    return FixedNumber.from(value)
}

export function toBigInt(value: Numberish) {
    if (typeof value === 'string' || value instanceof FixedNumber) {
        value = value.toString().split('.')[0]
    }

    return BigInt(value)
}
