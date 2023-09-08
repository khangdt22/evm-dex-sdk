import { encodeFunctionData, isAddressEqual, decodeFunctionData, decodeFunctionResult, type Log, decodeEventLog } from 'viem'
import type { AbiEvent } from 'abitype'
import { Dex } from '../dex'
import type { Address, CreateTransactionResult, ParsedAddLpTransaction, Hex, ParsedTradeTransaction, PairInfo, Transaction, EventFilter } from '../../types'
import { UNISWAP_V2_ROUTER, UNISWAP_V2_PAIR } from '../../abis'
import { TransactionType, TradeType } from '../../constants'
import { InvalidTransactionError } from '../../errors'
import { Pair } from '../../entities'
import type { UniswapV2TradeOptions, UniswapV2Options, UniswapV2PairData, UniswapV2PairInfo } from './types'
import { UniswapV2Trade, UniswapV2Pair } from './entities'
import { ADD_LIQUIDITY_SELECTORS, REMOVE_LIQUIDITY_SELECTORS, TRADE_SELECTORS, TRADE_FUNCTION_NAMES, EXACT_INPUT_TRADE_FUNCTION_NAMES } from './constants'

export class UniswapV2 extends Dex<UniswapV2PairData> {
    public readonly factory: Address
    public readonly router: Address
    public readonly fee: number
    public readonly pairInitCodeHash: Hex

    public constructor(options: UniswapV2Options) {
        super(options)

        this.factory = options.factory
        this.router = options.router
        this.fee = options.fee
        this.pairInitCodeHash = options.pairInitCodeHash
    }

    public isTransactionInThisDex(transaction: Transaction) {
        if (!transaction.to) {
            return false
        }

        return isAddressEqual(transaction.to, this.factory) || isAddressEqual(transaction.to, this.router)
    }

    public getApproveAddressForTrade() {
        return this.router
    }

    public getTransactionType(transaction: Transaction) {
        if (ADD_LIQUIDITY_SELECTORS.some((s) => transaction.input.startsWith(s))) {
            return TransactionType.ADD_LIQUIDITY
        }

        if (REMOVE_LIQUIDITY_SELECTORS.some((s) => transaction.input.startsWith(s))) {
            return TransactionType.REMOVE_LIQUIDITY
        }

        if (TRADE_SELECTORS.some((s) => transaction.input.startsWith(s))) {
            return TransactionType.TRADE
        }

        return void 0
    }

    public parseAddLiquidityTransaction(transaction: Transaction): ParsedAddLpTransaction {
        const { functionName, args } = decodeFunctionData({ abi: UNISWAP_V2_ROUTER, data: transaction.input })

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
                amountBDesired: transaction.value,
                amountAMin: args[2],
                amountBMin: args[3],
                recipient: args[4],
                deadline: Number(args[5]),
            }
        }

        throw new InvalidTransactionError('Not an add liquidity transaction', transaction)
    }

    public parseTradeTransaction(transaction: Transaction) {
        const { functionName, args } = decodeFunctionData({ abi: UNISWAP_V2_ROUTER, data: transaction.input })

        if (!this.isTradeFunction(functionName) || !args) {
            throw new InvalidTransactionError('Not a trade transaction', transaction)
        }

        const [path, recipient, deadline] = (args as any).slice(-3)

        let tradeType: TradeType
        let amountIn: bigint | undefined
        let amountOutMin: bigint | undefined
        let amountOut: bigint | undefined
        let amountInMax: bigint | undefined

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

        return result as ParsedTradeTransaction
    }

    public createTradeTransaction(options: UniswapV2TradeOptions): CreateTransactionResult {
        const trade = new UniswapV2Trade(options)
        const data = encodeFunctionData(trade.getEncodeParameters())
        const value = trade.getTransactionValue()

        return { data, value, to: this.router }
    }

    public createGetPairDataTransaction(pairInfo: UniswapV2PairInfo): CreateTransactionResult {
        const pair = new UniswapV2Pair(pairInfo, { reserveA: 0n, reserveB: 0n })
        const data = encodeFunctionData({ abi: UNISWAP_V2_PAIR, functionName: 'getReserves' })

        return { data, to: pair.address, value: 0n }
    }

    public parseGetPairDataResult(info: UniswapV2PairInfo, callResult: Hex): UniswapV2PairData {
        const pair = new UniswapV2Pair(info, { reserveA: 0n, reserveB: 0n })

        const result = decodeFunctionResult({
            abi: UNISWAP_V2_PAIR,
            functionName: 'getReserves',
            data: callResult,
        })

        const [reserveA, reserveB] = pair.token0.equals(info.tokenA) ? [result[0], result[1]] : [result[1], result[0]]

        return { reserveA, reserveB }
    }

    public createPair(info: UniswapV2PairInfo, data: UniswapV2PairData) {
        return new UniswapV2Pair(info, data)
    }

    public createUpdatePairsEventFilter(pairs: Pair[]): EventFilter {
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
        const pairs: Array<PairInfo<Dex, Address>> = []

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
