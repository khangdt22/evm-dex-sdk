import { FixedNumber } from '@ethersproject/bignumber'
import type { Numberish } from '../types'

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

    return BigInt(value.toString())
}

export function percentOf(value: Numberish, percent: number) {
    if (percent <= 0) {
        return FixedNumber.from('0')
    }

    if (percent >= 100) {
        return toFixedNumber(value)
    }

    return toFixedNumber(value).mulUnsafe(FixedNumber.from(percent.toString()).divUnsafe(FixedNumber.from('100')))
}
