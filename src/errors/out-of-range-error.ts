import type { Numberish } from '../types'
import { BaseError } from './base-error'
import type { ErrorOptions } from './types'

export interface OutOfRangeErrorOptions extends ErrorOptions {
    value?: Numberish
    min?: Numberish
    max?: Numberish
}

export class OutOfRangeError extends BaseError {
    public constructor({ value, min, max, ...options }: OutOfRangeErrorOptions = {}, message?: string) {
        if (!message) {
            message = value === undefined ? 'Out of range' : `${value} is out of range`

            if (min !== undefined && max !== undefined) {
                message += `, value must be between ${min} and ${max}`
            }
        }

        super(message, options)
    }
}
