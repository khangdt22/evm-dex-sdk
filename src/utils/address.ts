import { toBytes, getAddress, pad, slice, keccak256, concat } from 'viem'
import type { Address, Hex } from '../types'

export function getCreate2Address(_from: Address, _salt: Hex, initCodeHash: Hex): Address {
    const from = toBytes(getAddress(_from))
    const salt = pad(toBytes(_salt), { size: 32 })

    return getAddress(slice(keccak256(concat([toBytes('0xff'), from, salt, toBytes(initCodeHash)])), 12))
}
