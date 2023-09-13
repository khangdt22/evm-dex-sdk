import type { Transaction } from '../types'
import { BaseError } from './base-error'
import type { ErrorOptions } from './types'

export class InvalidTransactionError extends BaseError {
    public constructor(public readonly transaction: Transaction, reason?: string, options?: ErrorOptions) {
        let message = 'Transaction{hash}is invalid'.replace('{hash}', transaction.hash ? ` ${transaction.hash} ` : ' ')

        if (reason) {
            message += `: ${reason}`
        }

        super(message, options)
    }
}
