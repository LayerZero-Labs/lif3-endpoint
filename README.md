# lif3-endpoint
Lif3's LayerZero Endpoint

## Deployment:

Create a .env file and set to your deployers wallet:
```
MNEMONIC=
PRIVATE_KEY=
```

### V1 Endpoint:
cd to `v1-endpoint-deployment`

run:
`pnpm install`

`npx hardhat deploy --network avalanche-testnet --tags PriceFeed`
`npx hardhat deploy --network avalanche-testnet --tags FPValidator`
`npx hardhat deploy --network avalanche-testnet --tags MPTValidator01`
`npx hardhat deploy --network avalanche-testnet --tags NonceContract   `
`npx hardhat deploy --network avalanche-testnet --tags UltraLightNodeV2`
`npx hardhat deploy --network avalanche-testnet --tags TreasuryV2`
`npx hardhat deploy --network avalanche-testnet --tags RelayerV2`

### V2 Endpoint:
cd to `v2-endpoint-deployment`

run:
`pnpm install`

`npx hardhat deploy --network avalanche-testnet --tags EndpointV2`
`npx hardhat deploy --network avalanche-testnet --tags EndpointV2View`
`npx hardhat deploy --network avalanche-testnet --tags Treasury`
`npx hardhat deploy --network avalanche-testnet --tags SendUln302`
`npx hardhat deploy --network avalanche-testnet --tags ReceiveUln302`
`npx hardhat deploy --network avalanche-testnet --tags ReceiveUln302View`
`npx hardhat deploy --network avalanche-testnet --tags TreasuryFeeHandler`
`npx hardhat deploy --network avalanche-testnet --tags SendUln301`
`npx hardhat deploy --network avalanche-testnet --tags ReceiveUln301`
`npx hardhat deploy --network avalanche-testnet --tags ReceiveUln301View`
`npx hardhat deploy --network avalanche-testnet --tags DVNFeeLib`
`npx hardhat deploy --network avalanche-testnet --tags PriceFeed`
`npx hardhat deploy --network avalanche-testnet --tags DVN`
`npx hardhat deploy --network avalanche-testnet --tags ExecutorFeeLib`
`npx hardhat deploy --network avalanche-testnet --tags Executor`
`npx hardhat deploy --network avalanche-testnet --tags LzExecutor`