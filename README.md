# lif3-endpoint
Lif3's LayerZero Endpoint

## Deployment:

In `config.json` set endpointId to your desired number.

In both `v1-endpoint-deployment` and `v2-endpoint-deployment` create a .env file and set these to your deployer's wallet:
```
MNEMONIC=
PRIVATE_KEY=
```

Also make sure to do adjust the hardhat configs accordingly based on your needs. It's currently setup to deploy everything to avalanche-testnet.
You should only need to modify networks
```
    networks: {
        'avalanche-testnet': {
            eid: EndpointId.AVALANCHE_V2_TESTNET,
            url: process.env.RPC_URL_FUJI || 'https://rpc.ankr.com/avalanche_fuji',
            accounts,
        },
    },
```

### V1 Endpoint:
cd to `v1-endpoint-deployment`

run:
`pnpm install`

Note: this is setup to use avalanche-testnet. These can be easily switched to any network by doing a search and replace on this README.md

```
npx hardhat deploy --network avalanche-testnet --tags PriceFeed
```

```
npx hardhat deploy --network avalanche-testnet --tags FPValidator
```

```
npx hardhat deploy --network avalanche-testnet --tags MPTValidator01
```

```
npx hardhat deploy --network avalanche-testnet --tags NonceContract   
```

```
npx hardhat deploy --network avalanche-testnet --tags UltraLightNodeV2
```

```
npx hardhat deploy --network avalanche-testnet --tags TreasuryV2
```

```
npx hardhat deploy --network avalanche-testnet --tags RelayerV2
```


### V2 Endpoint:
cd to `v2-endpoint-deployment`

run:
`pnpm install`


```
npx hardhat deploy --network avalanche-testnet --tags EndpointV2
```
```
npx hardhat deploy --network avalanche-testnet --tags EndpointV2View
```
```
npx hardhat deploy --network avalanche-testnet --tags Treasury
```
```
npx hardhat deploy --network avalanche-testnet --tags SendUln302
```
```
npx hardhat deploy --network avalanche-testnet --tags ReceiveUln302
```
```
npx hardhat deploy --network avalanche-testnet --tags ReceiveUln302View
```
```
npx hardhat deploy --network avalanche-testnet --tags TreasuryFeeHandler
```
```
npx hardhat deploy --network avalanche-testnet --tags SendUln301
```
```
npx hardhat deploy --network avalanche-testnet --tags ReceiveUln301
```
```
npx hardhat deploy --network avalanche-testnet --tags ReceiveUln301View
```
```
npx hardhat deploy --network avalanche-testnet --tags DVNFeeLib
```
```
npx hardhat deploy --network avalanche-testnet --tags PriceFeed
```
```
npx hardhat deploy --network avalanche-testnet --tags DVN
```
```
npx hardhat deploy --network avalanche-testnet --tags ExecutorFeeLib
```
```
npx hardhat deploy --network avalanche-testnet --tags Executor
```
```
npx hardhat deploy --network avalanche-testnet --tags LzExecutor
```