import { Stage } from '@layerzerolabs/lz-definitions'

export interface DVNDeployConfig {
    [stage: string]: {
        [suffix: string]: {
            deploymentSuffix: string
            signers: string[]
            admins: string[]
            quorum: number
            priceFeedAddress?: string
        }
    }
}

const essenceAdmins: { [env in Stage]: string[] } = {
    [Stage.SANDBOX]: ['0x0e9971c0005D91336c1441b8F03c1C4fe5FB4584'],
    [Stage.TESTNET]: [
        '0xc13b65f7c53Cd6db2EA205a4b574b4a0858720A6', // testnet deployer
        '0xEb6304c9904DC04eF66D367B2EBc41525d1F231b', // testnet essense execute()'er
        '0x0a66ad3CBF27De2F6252d166f38eA8e8245A8C41', // chip
    ],
    [Stage.MAINNET]: [
        '0x9F403140Bc0574D7d36eA472b82DAa1Bbd4eF327',
        '0xB52Fa54FC261398058c3Ac7B8dD442D7d8B9F0B6', // mainnet dv deployer and operational admin
        '0xB8FF877ed78Ba520Ece21B1de7843A8a57cA47Cb', // essence executor
    ],
}

export const supportedDVNDeployConfig: DVNDeployConfig = {
    [Stage.SANDBOX]: {
        default: {
            deploymentSuffix: '',
            signers: [],
            admins: essenceAdmins[Stage.SANDBOX],
            quorum: 1,
        },
        gcda: {
            deploymentSuffix: 'GCDA',
            signers: [],
            admins: essenceAdmins[Stage.SANDBOX],
            quorum: 1,
        },
    },
    [Stage.TESTNET]: {
        // layerzero
        default: {
            deploymentSuffix: '',
            signers: [
                '0x803372a29B7d63b7364F4666392ef59Ee24F24d5',
                '0x39fe585C5edd85dAD6103039aa03e85FB6851C75',
                '0xF8bbDBc3260D68936B3FaDA6445C4Bb58d9AaD09',
            ],
            admins: essenceAdmins[Stage.TESTNET],
            quorum: 2,
        },
        gcda: {
            deploymentSuffix: 'GCDA',
            signers: [
                '0x825a9fc02527eb260a2d67c58af502f2c3da4cb4',
                '0x253596a9ac54ceb3c571ccf3be3411abf8e063a9',
                '0x58385370986f306afa6064051bb383f2b5b5d811',
            ],
            admins: [
                '0xc13b65f7c53Cd6db2EA205a4b574b4a0858720A6', // testnet deployer
                '0xEb6304c9904DC04eF66D367B2EBc41525d1F231b', // testnet essense execute()'er
                '0x0a66ad3CBF27De2F6252d166f38eA8e8245A8C41', // chip
                '0x0e251d9095dD128292A28eB383127d05d95BBD17', // goulding deployer
            ],
            quorum: 2,
            // default price feed
        },
        nethermind: {
            deploymentSuffix: 'Nethermind',
            signers: ['0x103b1df14795be07016c6d38b6a1e0361c591e49'],
            admins: essenceAdmins[Stage.TESTNET],
            quorum: 1,
        },
        tapioca: {
            deploymentSuffix: 'Tapioca',
            signers: ['0x7F22f1656230894206eeDA9800eb38481284121B'],
            admins: essenceAdmins[Stage.TESTNET],
            quorum: 1,
        },
        delegate: {
            deploymentSuffix: 'Delegate',
            signers: ['0x1c19ee381a75d81fc53bc193181e8853a50c32a5'],
            admins: essenceAdmins[Stage.TESTNET],
            quorum: 1,
        },
        switchboard: {
            deploymentSuffix: 'Switchboard',
            signers: ['0x96c588e0c66434dba7b1819f9e03256b280da556'],
            admins: essenceAdmins[Stage.TESTNET],
            quorum: 1,
        },
        stablelab: {
            deploymentSuffix: 'Stablelab',
            signers: ['0xa10a1fd5a72a017bab4cab2dd518d1940703a9aa'],
            admins: essenceAdmins[Stage.TESTNET],
            quorum: 1,
        },
        gitcoin: {
            deploymentSuffix: 'Gitcoin',
            signers: ['0x65f84952F4CbCcc7D3b777469775A104d72a84B3'],
            admins: essenceAdmins[Stage.TESTNET],
            quorum: 1,
        },
        p2p: {
            deploymentSuffix: 'P2P',
            signers: ['0x14d45596a07a0947fca6d0e0612ace605e471a5e'],
            admins: essenceAdmins[Stage.TESTNET],
            quorum: 1,
        },
        bware: {
            deploymentSuffix: 'Bware',
            signers: ['0xdF70763636C4F47EA9b1A9c0A211a84df6AFacC2'],
            admins: essenceAdmins[Stage.TESTNET],
            quorum: 1,
        },
    },
    [Stage.MAINNET]: {
        // layerzero
        default: {
            deploymentSuffix: '',
            signers: [
                '0x5AB40527AA622960E26a171c58011de58DFA5bE9',
                '0x7e1879A1Fba74d8107E2E3EE42f5fea5E6500f5B',
                '0xE4059e1B02d8d74Fc82d27BD5006Ecc3605D9CEc',
            ],
            admins: [
                '0x9F403140Bc0574D7d36eA472b82DAa1Bbd4eF327', // mainnet deployer
                '0xB8FF877ed78Ba520Ece21B1de7843A8a57cA47Cb', // essence executor
            ],
            quorum: 2,
            // default price feed
        },
        gcda: {
            deploymentSuffix: 'GCDA',
            signers: [
                '0xddbdc840164da20bcf6aa85c3957396c14642ab1',
                '0x0d099360a069359fe7c9503ab44cbcb9eb2a7466',
                '0x94bc8ba19b4cce7aac14e2679942fc567e027c67',
            ],
            admins: [
                '0x5EE2B0fd8d964cB50e787DB4fF176D7bbb0fD180', // deployer
                '0x5b1DaD86c9c4aE282BBAbbE89C5f6231C065c236', // mainnet EssenceAdmin GCDA operational Admin
                '0x21C3de23d98Caddc406E3d31b25e807aDDF33633', // mainnet Essence GCDA execute()'er
            ],
            quorum: 2,
            // default price feed
        },
        tapioca: {
            deploymentSuffix: 'Tapioca',
            signers: ['0x5431deE4114E460916d81E360321fdfD9C175582'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        stablelab: {
            deploymentSuffix: 'Stablelab',
            signers: ['0xf137c0b521d05f38968f12eac73319902892944f'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        nethermind: {
            deploymentSuffix: 'Nethermind',
            signers: ['0x103b1df14795be07016c6d38b6a1e0361c591e49'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        blockdaemon: {
            deploymentSuffix: 'Blockdaemon',
            signers: ['0x1f38850bb295bbb1eb2f6886dc6e1770a4d3d3dc'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        mim: {
            deploymentSuffix: 'MIM',
            signers: ['0x2a4360fb98b5a6514c9c27c6e81ac8f83d7297c0'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        planetarium: {
            deploymentSuffix: 'Planetarium',
            signers: ['0x1d9ec57b17ccaa46c9fd6ec0274cfd41c76e2a43'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        republic: {
            deploymentSuffix: 'Republic',
            signers: ['0xbdabfdcfd8bf447967cb81d13d505a84571f88f4'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        nocturnal: {
            deploymentSuffix: 'Nocturnal',
            signers: ['0x80994D5F4EF4b8Ab49c44Bf302c68400e4f86e78'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        shrapnel: {
            deploymentSuffix: 'Shrapnel',
            signers: ['0x8F3aaFaa05616bF388266Fe22afA92502B8a7a79', '0x213eB25CED5699A532E8A9FAE0158CeF73Fa50d7'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 2,
        },
        lagrange: {
            deploymentSuffix: 'Lagrange',
            signers: ['0x237951918a4909B85723303a164DEca32B503adf'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        horizen: {
            deploymentSuffix: 'Horizen',
            signers: ['0x8e5F5b2Aa22EbC274E5E8dA08Aef90c60Fb9b4e4', '0x4777Be04572CF445ff2c711fe924522bFd559193'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 2,
        },
        nodesguru: {
            deploymentSuffix: 'Nodesguru',
            signers: ['0x5fbEaF1caCB6aF4D8757660801E9e8976e1f7E2D'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        bware: {
            deploymentSuffix: 'Bware',
            signers: ['0x20cBb0A8DD90Fb5F0f9A88AE74896A82A7a4fD13'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        animoca: {
            deploymentSuffix: 'Animoca',
            signers: ['0xda05cbd2b12b5c80193f52dddc54543f895ce2fc'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        blockhunters: {
            deploymentSuffix: 'Blockhunters',
            signers: ['0x6B8e1f5DF0777f8e969135112cd7Ca086Dda95CF', '0x0f7FF35cb146152CDD5bc19d10C9f2e0FF213217'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 2,
        },
        p2p: {
            deploymentSuffix: 'P2P',
            signers: ['0xe437caabe4da93f93a278aa47bc83495aacdf2d2'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        superduper: {
            deploymentSuffix: 'Superduper',
            signers: ['0xeAee18fe86CEFf37B393773F43cfb3B77B77aD23'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        delegate: {
            deploymentSuffix: 'Delegate',
            signers: ['0x6adabea1e42958fe4c3597e8a3675adb7af605df'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        '01node': {
            deploymentSuffix: '01Node',
            signers: ['0x2E6F38d111DC74f9a9DAAFCF2De71F7489c44924'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        restake: {
            deploymentSuffix: 'Restake',
            signers: ['0x6b58747defed7eeac9a92839c682491c9093e9e3'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        bcw: {
            deploymentSuffix: 'BCW',
            signers: ['0x000f8df3fd788a12777a083beddc447263d31720'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        switchboard: {
            deploymentSuffix: 'Switchboard',
            signers: ['0x69dcdc79f2720785485d4aa0e5d0e1d443f0f6c3'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        gitcoin: {
            deploymentSuffix: 'Gitcoin',
            signers: ['0xb977605D38E2DeCDba229c742906086fD962dB54'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        abdb: {
            deploymentSuffix: 'ABDB',
            signers: ['0xda05cbd2b12b5c80193f52dddc54543f895ce2fc', '0x1f38850bb295bbb1eb2f6886dc6e1770a4d3d3dc'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        luganodes: {
            deploymentSuffix: 'Luganodes',
            signers: ['0xf5e075609ac2376572752d16f5152d59601183df'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        stakingcabin: {
            deploymentSuffix: 'Stakingcabin',
            signers: ['0xBC43b6f96399F42f8f545D0f7a569d18fAaCFc1F'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        pops: {
            deploymentSuffix: 'Pops',
            signers: ['0xefC1eb0dB17b7A3039eEF8601fe5Ce4Bf457f776'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        omnix: {
            deploymentSuffix: 'Omnix',
            signers: ['0xa595363d5c72fdd9e179c6d8a20e68d561ac9207'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
        zenrock: {
            deploymentSuffix: 'Zenrock',
            signers: ['0xC242767d8A3D40330db0DefEc1da5C99bd6b43F4'],
            admins: essenceAdmins[Stage.MAINNET],
            quorum: 1,
        },
    },
}
