import type { Log, Address, Hex, Hash } from 'viem'
import { encodeFunctionData, isAddressEqual, decodeFunctionData, decodeFunctionResult, decodeEventLog, slice } from 'viem'
import type { AbiEvent } from 'abitype'
import type { Nullable } from '@khangdt22/utils/types'
import { Dex } from '../dex'
import type { CreateTransactionResult, Transaction, EventFilter } from '../../types'
import { UNISWAP_V2_ROUTER, UNISWAP_V2_PAIR } from '../../abis'
import { TradeType, TransactionType } from '../../constants'
import { InvalidTransactionError } from '../../errors'
import { Token, NativeToken } from '../../entities'
import type { AddLiquidityData, TradeData } from '../types'
import type { UniswapV2TradeOptions, UniswapV2Options, UniswapV2PairData, UniswapV2PairMetadata } from './types'
import { UniswapV2Trade, UniswapV2Pair } from './entities'
import { TRADE_FUNCTION_NAMES, EXACT_INPUT_TRADE_FUNCTION_NAMES, TRANSACTION_TYPE_BY_SELECTOR } from './constants'

export class UniswapV2 extends Dex<Token | NativeToken, UniswapV2Pair, UniswapV2PairMetadata> {
    public readonly factory: Address
    public readonly router: Address
    public readonly fee: number
    public readonly pairBytecodeHash: Hash

    public constructor(options: UniswapV2Options) {
        super(options)

        this.factory = options.factory
        this.router = options.router
        this.fee = options.fee
        this.pairBytecodeHash = options.pairBytecodeHash
    }

    public isTransactionInThisDex(transaction: Transaction) {
        if (!transaction.to) {
            return false
        }

        return isAddressEqual(transaction.to, this.factory) || isAddressEqual(transaction.to, this.router)
    }

    public getTransactionType(transaction: Transaction) {
        const data = this.getTransactionData(transaction)

        if (data.length < 10) {
            return TransactionType.UNKNOWN
        }

        const selector = slice(data, 0, 4, { strict: true })

        return TRANSACTION_TYPE_BY_SELECTOR[selector] ?? TransactionType.UNKNOWN
    }

    public getApproveAddressForTrade() {
        return this.router
    }

    public parseAddLiquidityTransaction(transaction: Transaction): AddLiquidityData {
        const data = this.getTransactionData(transaction)
        const { functionName, args } = decodeFunctionData({ abi: UNISWAP_V2_ROUTER, data })

        if (functionName === 'addLiquidity') {
            return {
                tokenA: args[0],
                tokenB: args[1],
                pairFee: this.fee,
                amountADesired: args[2],
                amountBDesired: args[3],
                amountAMin: args[4],
                amountBMin: args[5],
                recipient: args[6],
                deadline: Number(args[7]),
            }
        }

        if (functionName === 'addLiquidityETH') {
            return {
                tokenA: args[0],
                tokenB: this.nativeToken.wrapped.address,
                pairFee: this.fee,
                amountADesired: args[1],
                amountBDesired: transaction.value ?? 0n,
                amountAMin: args[2],
                amountBMin: args[3],
                recipient: args[4],
                deadline: Number(args[5]),
            }
        }

        throw new InvalidTransactionError(transaction, 'not is add liquidity transaction')
    }

    public parseTradeTransaction(transaction: Transaction) {
        const data = this.getTransactionData(transaction)
        const { functionName, args } = decodeFunctionData({ abi: UNISWAP_V2_ROUTER, data })

        if (!this.isTradeFunction(functionName) || !args) {
            throw new InvalidTransactionError(transaction, 'Not is trade transaction')
        }

        const [path, recipient, deadline] = (args as any).slice(-3)

        let tradeType: TradeType
        let amountIn: Nullable<bigint>
        let amountOutMin: Nullable<bigint>
        let amountOut: Nullable<bigint>
        let amountInMax: Nullable<bigint>

        if (this.isExactInputTradeFunction(functionName)) {
            tradeType = TradeType.EXACT_INPUT

            if (functionName == 'swapExactETHForTokens' || functionName == 'swapExactETHForTokensSupportingFeeOnTransferTokens') {
                amountIn = transaction.value
                amountOutMin = args[0]
            } else {
                amountIn = args[0] as bigint
                amountOutMin = args[1] as bigint
            }
        } else {
            tradeType = TradeType.EXACT_OUTPUT
            amountOut = (args[0] as bigint)
            amountInMax = functionName == 'swapETHForExactTokens' ? transaction.value : args[1] as bigint
        }

        const result = {
            type: tradeType,
            pairs: this.pathToPairs(path),
            input: path[0],
            output: path.at(-1),
            path,
            recipient,
            deadline,
            feeOnTransfer: functionName.endsWith('SupportingFeeOnTransferTokens'),
        }

        if (result.type === TradeType.EXACT_INPUT) {
            Object.assign(result, { amountIn, amountOutMin })
        } else {
            Object.assign(result, { amountOut, amountInMax })
        }

        return result as unknown as TradeData
    }

    public parseGetPairMetadataResult(data: UniswapV2PairData, callResult: Hex): UniswapV2PairMetadata {
        const pair = this.createPair(data, { reserveA: 0n, reserveB: 0n })

        const result = decodeFunctionResult({
            abi: UNISWAP_V2_PAIR,
            functionName: 'getReserves',
            data: callResult,
        })

        const [reserveA, reserveB] = pair.token0.equals(data.tokenA) ? [result[0], result[1]] : [result[1], result[0]]

        return { reserveA, reserveB }
    }

    public createTradeTransaction(options: UniswapV2TradeOptions): CreateTransactionResult {
        const trade = new UniswapV2Trade(options)
        const data = trade.getTransactionData()
        const value = trade.getTransactionValue()

        return { data, value, to: this.router }
    }

    public createGetPairMetadataTransaction(pairData: UniswapV2PairData): CreateTransactionResult {
        const pair = new UniswapV2Pair({ ...pairData, dex: this }, { reserveA: 0n, reserveB: 0n })
        const data = encodeFunctionData({ abi: UNISWAP_V2_PAIR, functionName: 'getReserves' })

        return { data, to: pair.address, value: 0n }
    }

    public createPair(data: UniswapV2PairData, metadata: UniswapV2PairMetadata) {
        return new UniswapV2Pair({ ...data, dex: this }, metadata)
    }

    public createUpdatePairsEventFilter(pairs: UniswapV2Pair[]): EventFilter {
        const address = pairs.map((i) => i.address)
        const event = UNISWAP_V2_PAIR.find((i) => i.type === 'event' && i.name === 'Sync')! as AbiEvent

        return { address, event }
    }

    public updatePairsByLogs(pairs: UniswapV2Pair[], logs: Log[]) {
        const pairsByAddress = Object.fromEntries(pairs.map((i) => [i.address.toLowerCase(), i]))

        for (const log of logs.sort((a, b) => (a.logIndex ?? 0) - (b.logIndex ?? 0))) {
            const address = log.address.toLowerCase()

            if (!pairsByAddress[address]) {
                continue
            }

            const { eventName, args } = decodeEventLog({ abi: UNISWAP_V2_PAIR, data: log.data, topics: log.topics })

            if (eventName !== 'Sync') {
                continue
            }

            const { reserve0, reserve1 } = args

            if (pairsByAddress[address].reserve0 != reserve0 || pairsByAddress[address].reserve1 != reserve1) {
                pairsByAddress[address].updateReserves(reserve0, reserve1)
                this.emit('pairUpdated', pairsByAddress[address], { reserve0, reserve1 })
            }
        }

        return Object.values(pairsByAddress)
    }

    protected pathToPairs(path: Address[]) {
        const pairs: Array<UniswapV2PairData<Address>> = []

        for (let i = 0; i < path.length - 1; i++) {
            pairs.push({ dex: this, tokenA: path[i], tokenB: path[i + 1], fee: this.fee })
        }

        return pairs
    }

    protected isTradeFunction(input: any): input is typeof TRADE_FUNCTION_NAMES[number] {
        return TRADE_FUNCTION_NAMES.includes(input)
    }

    protected isExactInputTradeFunction(input: any): input is typeof EXACT_INPUT_TRADE_FUNCTION_NAMES[number] {
        return EXACT_INPUT_TRADE_FUNCTION_NAMES.includes(input)
    }
}
