import type { PublicClient, Address, Chain } from 'viem'
import { NativeToken, Token } from '../entities'
import { ERC20 } from '../abis'

export function isNative<T extends NativeToken = NativeToken>(currency: unknown): currency is T {
    return currency instanceof NativeToken
}

export function isToken<T extends Token = Token>(currency: unknown): currency is T {
    return currency instanceof Token
}

export async function tokenFromAddress(publicClient: PublicClient, address: Address) {
    const contract = <const>{ address, abi: ERC20 }

    const [name, symbol, decimals] = await publicClient.multicall({
        allowFailure: false,
        contracts: [
            { ...contract, functionName: 'name' },
            { ...contract, functionName: 'symbol' },
            { ...contract, functionName: 'decimals' },
        ],
    })

    return new Token(address, name, symbol, decimals)
}

export function nativeTokenFromChain(chain: Chain, wrapped: Token) {
    return new NativeToken({ ...chain.nativeCurrency, wrapped })
}
