import type { ErrorOptions } from './types'

export class BaseError extends Error {
    public constructor(message?: string, options: ErrorOptions = {}) {
        super(message ?? 'An error occurred')

        for (const [key, value] of Object.entries(options)) {
            this[key] = value
        }
    }
}
