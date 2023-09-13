import type { Numberish } from '../types'
import { OutOfRangeError } from '../errors'
import { ZERO, ONE_HUNDRED } from '../constants'
import { toFixedNumber } from './number'

export function percentOf(value: Numberish, percent: number) {
    if (percent < 0 || percent > 100) {
        throw new OutOfRangeError({ value, min: 0, max: 100 })
    }

    if (percent === 0) {
        return ZERO
    }

    if (percent === 100) {
        return toFixedNumber(value)
    }

    return toFixedNumber(value).mulUnsafe(toFixedNumber(percent).divUnsafe(ONE_HUNDRED))
}
