import type { Address } from 'viem'
import type { DexOptions } from '../types'

export interface UniswapV2Options extends DexOptions {
    router: Address
    factory: Address
    fee: number
}
