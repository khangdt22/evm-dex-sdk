import type { Address } from 'viem'
import { parseUnits, keccak256, encodePacked, isAddressEqual, formatUnits } from 'viem'
import { Pair, Token, NativeToken } from '../../../entities'
import type { UniswapV2PairData, UniswapV2PairMetadata } from '../types'
import { getCreate2Address, isFormattedNumber } from '../../../utils'
import type { FormattedNumber, InputNumber } from '../../../types'
import type { UniswapV2 } from '../uniswap-v2'

export class UniswapV2Pair extends Pair<NativeToken | Token> {
    public readonly address: Address
    public readonly dex: UniswapV2

    public readonly token0: Token
    public readonly token1: Token

    public readonly fee: bigint
    public readonly feeDecimals: number

    public reserve0: bigint
    public reserve1: bigint

    private readonly oneHundredPercent: bigint

    public constructor(data: UniswapV2PairData, { reserveA, reserveB }: UniswapV2PairMetadata) {
        super(data)

        this.dex = data.dex

        const tokenA = data.tokenA.wrapped
        const tokenB = data.tokenB.wrapped
        const isTokenASortsBeforeTokenB = tokenA.sortsBefore(tokenB)

        const [token0, token1] = isTokenASortsBeforeTokenB ? [tokenA, tokenB] : [tokenB, tokenA]
        const [reserve0, reserve1] = isTokenASortsBeforeTokenB ? [reserveA, reserveB] : [reserveB, reserveA]

        this.token0 = token0
        this.token1 = token1
        this.reserve0 = reserve0
        this.reserve1 = reserve1

        this.feeDecimals = Number(data.fee.toString().split('.')[1]?.length ?? 0)
        this.fee = parseUnits(data.fee.toString(), this.feeDecimals)
        this.oneHundredPercent = parseUnits('100', this.feeDecimals)

        this.address = this.computeAddress()
    }

    public involves(token: Address | NativeToken | Token) {
        let address: Address

        if (token instanceof NativeToken) {
            address = token.wrapped.address
        } else if (token instanceof Token) {
            address = token.address
        } else {
            address = token
        }

        return isAddressEqual(address, this.token0.address) || isAddressEqual(address, this.token1.address)
    }

    public getAmountOut(tokenIn: NativeToken | Token, amountIn: InputNumber): FormattedNumber {
        const token = tokenIn instanceof NativeToken ? tokenIn.wrapped : tokenIn
        const [reserveIn, reserveOut] = this.getReserves(token)
        const amount = isFormattedNumber(amountIn) ? amountIn.value : parseUnits(amountIn.toString(), token.decimals)

        const amountInWithFee = amount * (this.oneHundredPercent - this.fee)
        const numerator = amountInWithFee * reserveOut
        const denominator = reserveIn * this.oneHundredPercent + amountInWithFee
        const value = numerator / denominator

        return { value, decimals: token.decimals, formatted: formatUnits(value, token.decimals) }
    }

    public getAmountIn(tokenOut: NativeToken | Token, amountOut: InputNumber): FormattedNumber {
        const token = tokenOut instanceof NativeToken ? tokenOut.wrapped : tokenOut
        const [reserveOut, reserveIn] = this.getReserves(token)
        const amount = isFormattedNumber(amountOut) ? amountOut.value : parseUnits(amountOut.toString(), token.decimals)

        const numerator = reserveIn * amount * this.oneHundredPercent
        const denominator = (reserveOut - amount) * (this.oneHundredPercent - this.fee)
        const value = (numerator / denominator) + 1n

        return { value, decimals: token.decimals, formatted: formatUnits(value, token.decimals) }
    }

    public priceOf(token: NativeToken | Token): FormattedNumber {
        return this.getAmountOut(token, 1)
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
            this.dex.pairBytecodeHash
        )
    }
}
