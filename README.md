# lif3-endpoint
Lif3's LayerZero Endpoint

---

> **⚠️ IMPORTANT NOTICE**
> 
> Before deploying Endpoint V2, it is crucial to deploy Endpoint V1 first. The V2 deployment process relies on certain components and addresses from the V1 deployment. Failing to deploy V1 before V2 will result in errors and an incomplete setup.

---

# Project Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/lif3-endpoint.git
   cd lif3-endpoint
   ```

2. Run the setup command with your mnemonic:
   ```
   bash -c 'mnemonic="Your mnemonic phrase here"; for dir in . v1-endpoint-deployment v2-endpoint-deployment; do echo "MNEMONIC=$mnemonic" > "$dir/.env"; done; echo "Environment setup complete."'
   ```

   Replace "Your mnemonic phrase here" with your actual mnemonic phrase. This command will create `.env` files in the root directory and both endpoint directories.

3. Your environment is now set up and ready to use.

Note: Make sure to keep your mnemonic secure and never share it publicly.

## Deployment:

In `config.json` set endpointV1Id to your desired number.

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
            eid: endpointV1Id.AVALANCHE_V2_TESTNET,
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
npx hardhat deploy --network avalanche-testnet --tags PriceFeed,FPValidator,MPTValidator01,NonceContract,UltraLightNodeV2,TreasuryV2,RelayerV2
```


### V2 Endpoint:
cd to `v2-endpoint-deployment`

run:
`pnpm install`

```
npx hardhat deploy --network avalanche-testnet --tags EndpointV2,EndpointV2View,Treasury,SendUln302,ReceiveUln302,ReceiveUln302View,TreasuryFeeHandler,SendUln301,ReceiveUln301,ReceiveUln301View,PriceFeed
```
Deploy DVNFeeLib and DVN
```
npx hardhat deploy --network avalanche-testnet --tags DVNFeeLib,DVN
```
Deploy Executor
```
npx hardhat deploy --network avalanche-testnet --tags ExecutorFeeLib,Executor,LzExecutor
```