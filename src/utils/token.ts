import { Currency, NativeToken } from '../entities'

export function isNative(currency: Currency): currency is NativeToken {
    return currency instanceof NativeToken
}
