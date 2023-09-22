import { Token } from '../entities'

export interface NativeTokenData {
    name: string
    symbol: string
    decimals: number
    wrapped: Token
}
