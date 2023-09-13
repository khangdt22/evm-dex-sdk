import type { Address, Hash } from 'viem'
import type { Token, NativeToken } from '../../entities'
import type { TradeOptions, PairData } from '../../types'
import type { DexOptions } from '../types'
import type { UniswapV2Pair } from './entities'
import type { UniswapV2 } from './uniswap-v2'

export interface UniswapV2PairData<TCurrency = NativeToken | Token> extends PairData<TCurrency> {
    dex: UniswapV2
}

export type UniswapV2TradeOptions = TradeOptions<UniswapV2Pair, NativeToken | Token>

export interface UniswapV2Options extends DexOptions {
    factory: Address
    router: Address
    fee: number
    pairBytecodeHash: Hash
}

export interface UniswapV2PairMetadata {
    reserveA: bigint
    reserveB: bigint
}
