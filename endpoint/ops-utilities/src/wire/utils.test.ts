import { ethers } from 'ethers'

import { mockAddress } from '../../tests/transaction.fixture'

import { buildEVMRawTransaction } from './utils'

describe('buildEVMRawTransaction', () => {
    it('should encode a contract method with its params', () => {
        const dummyAddress = mockAddress()
        const abi = ['function transferFrom(address from, address to, uint value)']
        const contract = new ethers.Contract(dummyAddress, abi)
        const method = 'transferFrom'
        const args = [
            '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
            '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
            ethers.utils.parseEther('1.0'),
        ]

        const raw = buildEVMRawTransaction(contract, method, args)
        expect(raw.data).toEqual(
            '0x23b872dd0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c0000000000000000000000000000000000000000000000000de0b6b3a7640000'
        )
        expect(raw.to).toEqual(contract.address)
    })
})
