import { parseUnits, keccak256, encodePacked, isAddressEqual } from 'viem'
import { Pair, Token } from '../../../entities'
import type { UniswapV2PairInfo, UniswapV2PairData } from '../types'
import type { UniswapV2 } from '../uniswap-v2'
import type { Address } from '../../../types'
import { getCreate2Address } from '../../../utils'

export class UniswapV2Pair extends Pair<UniswapV2> {
    public readonly address: Address

    public readonly token0: Token
    public readonly token1: Token

    public readonly fee: bigint
    public readonly feeDecimals: number
    public readonly oneHundredPercent: bigint

    public reserve0: bigint
    public reserve1: bigint

    public constructor(options: UniswapV2PairInfo, { reserveA, reserveB }: UniswapV2PairData) {
        super(options)

        const { tokenA, tokenB, fee } = options
        const isTokenASortsBeforeTokenB = tokenA.sortsBefore(tokenB)
        const [token0, token1] = isTokenASortsBeforeTokenB ? [tokenA, tokenB] : [tokenB, tokenA]
        const [reserve0, reserve1] = isTokenASortsBeforeTokenB ? [reserveA, reserveB] : [reserveB, reserveA]

        this.token0 = token0
        this.token1 = token1
        this.reserve0 = reserve0
        this.reserve1 = reserve1

        this.feeDecimals = Number(fee.toString().split('.')[1]?.length ?? 0)
        this.fee = parseUnits(fee.toString(), this.feeDecimals)
        this.oneHundredPercent = parseUnits('100', this.feeDecimals)

        this.address = this.computeAddress()
    }

    public involvesToken(token: Address | Token) {
        if (token instanceof Token) {
            token = token.address
        }

        return isAddressEqual(token, this.token0.address) || isAddressEqual(token, this.token1.address)
    }

    public getAmountOut(tokenIn: Token, amountIn: bigint) {
        const [reserveIn, reserveOut] = this.getReserves(tokenIn)

        const amountInWithFee = amountIn * (this.oneHundredPercent - this.fee)
        const numerator = amountInWithFee * reserveOut
        const denominator = reserveIn * this.oneHundredPercent + amountInWithFee

        return numerator / denominator
    }

    public getAmountIn(tokenOut: Token, amountOut: bigint) {
        const [reserveOut, reserveIn] = this.getReserves(tokenOut)

        const numerator = reserveIn * amountOut * this.oneHundredPercent
        const denominator = (reserveOut - amountOut) * (this.oneHundredPercent - this.fee)

        return (numerator / denominator) + 1n
    }

    public getReserves(tokenA: Token): [bigint, bigint] {
        return this.token0.equals(tokenA) ? [this.reserve0, this.reserve1] : [this.reserve1, this.reserve0]
    }

    public updateReserves(reserve0: bigint, reserve1: bigint) {
        this.reserve0 = reserve0
        this.reserve1 = reserve1
    }

    protected computeAddress(): Address {
        return getCreate2Address(
            this.dex.factory,
            keccak256(encodePacked(['address', 'address'], [this.token0.address, this.token1.address])),
            this.dex.pairInitCodeHash
        )
    }
}
