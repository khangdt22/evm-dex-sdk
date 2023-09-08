import { BaseError } from './base-error'

export class InvalidTransactionError extends BaseError {
    public constructor(message: string, public readonly transaction?: any) {
        super(message)
    }
}
