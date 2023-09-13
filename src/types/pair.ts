import { Token } from '../entities'

export interface PairData<TCurrency = Token> {
    tokenA: TCurrency
    tokenB: TCurrency
    fee: number
}
