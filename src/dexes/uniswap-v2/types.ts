import type { Token, NativeToken } from '../../entities'
import type { TradeOptions, Address, DexOptions, PairInfo, Hex } from '../../types'
import type { UniswapV2Pair } from './entities'
import type { UniswapV2 } from './uniswap-v2'

export interface UniswapV2PairData {
    reserveA: bigint
    reserveB: bigint
}

export type UniswapV2PairInfo = PairInfo<UniswapV2>

export type UniswapV2TradeOptions = TradeOptions<UniswapV2Pair, NativeToken | Token>

export interface UniswapV2Options extends DexOptions {
    factory: Address
    router: Address
    fee: number
    pairInitCodeHash: Hex
}
