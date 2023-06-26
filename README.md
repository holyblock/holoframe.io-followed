# 👾 Hologram-Core

This repo contains the frontend, contracts, extension, and face model code for Hologram's suite of products.

# 🎬 Quick Start

## Manual setup

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)


> clone/fork 👾 core:

```bash
git clone https://github.com/hologramxyz/core.git
```

> install all 🕸 dependencies:

```bash
cd core
yarn install
```

> add a dependency:

```bash
yarn workspace <workspace_name> add <packages> 
```

### Contracts

Prerequisite: 
1. create .env file in accordance to example.env
2. for deploying to mainnet with hd wallet, add mnemonic.txt file in contract root
3. specify network name (ex. goerli) and networks in hardhat.config.js

> run local dev chain

```bash
yarn chain
```

> run contract tests

```bash
yarn test-contracts
```

> run contract deploy script (contracts/deploy)

```bash
yarn deploy-contracts
```

> upload model and image for single Honorary to Arweave via Bundlr
1. Under contracts/assets/honoraries, add folder with model file (.zip for Live2D, .glb for 3D), image file, and gif file in it. Give a consistent name for the honorary (ex. folder coolcat4800 with coolcat4800.zip and coolcat4800.png inside)
2. Go to contracts/scripts/uploadHonoraryAssetFolder.js, set "assetName" to the name you gave the asset folder in step 1 (ex. coolcat4800)
3. In terminal in project root, run the following command from project root
```bash
yarn upload-asset-folder
```
4. If need to upload any files separately, set "assetFilePath" in contracts/scripts/uploadHonoraryAssetFile.js, then run the following command from project root
```bash
yarn upload-asset-file
```

> upload tokenURI for single Honorary to Arweave via Bundlr (after uploading model and image)
1. Open contracts/utils/honoraryAssetURIs.json, add a new tokenURI JSON for the honorary whose assets you just uploaded to the array. Make sure the name field matches with the name of the honorary. 
2. Go to contracts/scripts/uploadHonoraryURIs.js, set "targetURIName" to the name of the honorary.
3. In terminal in project root, run the following command
```bash
yarn upload-uri
```
4. Keep track of the txID output of the console log upon successful upload. The new tokenURI link to use for minting the honorary is "https://arweave.net/<txID>" 


> run NFT minting script for honorary NFT (contracts/scripts/mintHoloHonorary.js)
1. Fill in "tokenURI" variable
2. Run command below from project root

```bash
yarn mint-honorary
```

> create new NFT collection from factory contract (contracts/scripts/createHoloCollection.js)
1. Fill in "name", "symbol", "originAddr", "totalSupply", and "royaltyBPS" variables
2. Run command below from project root

```bash
yarn mint-honorary
```

> (DEPRECATED) create Arweave manifest to generate relative paths (for using Ardrive)

```bash
ardrive create-manifest -f "<ardrive_folder_id>" -w <path_to_arweave_wallet_json>
```

### Desktop

Prerequisites:
1. (For development only) Start dev mode for web workspace
```bash
yarn dev-web
```
2. Go to Desktop folder (This is not a workspace)
```bash
cd desktop
```
3. Install dependencies
```bash
yarn install
```

> start development mode:
```bash
yarn start
```

> package for production:
```bash
yarn run package
```

### Extension

Prerequisites: 
1. Set up [Moralis](https://moralis.io/) and [Infura](https://infura.io/)
2. create .env.development and .env.production files with these variables:

REACT_APP_MORALIS_APP_ID
REACT_APP_MORALIS_SERVER_URL
REACT_APP_INFURA_RPC_KEY
ALTER_API_KEY
MIXPANEL_PROJECT_TOKEN

> start your extension frontend (cmd + s rebuilds frontend automatically):

```bash
yarn start-extension
```

> local development: build your extension (content + background script changes requires re-running this)

```bash
yarn build-extension
```

> production build: build your extension

```bash
yarn deploy-extension
```

### Web

Prerequisites: 
1. create .env.local file with these variables:

MORALIS_APP_ID
MORALIS_SERVER_URL
ALTER_API_KEY

> start your web frontend in development mode (cmd + s rebuilds frontend automatically):

```bash
yarn dev-web
```

> build your web frontend

```bash
yarn build-web
```

> start your web frontend (run the build locally):

```bash
yarn start-web
```

### Plugins

## Studio
> start the plugin (for testing on 'example' repos)
```bash
yarn start-studio
```

> build the plugin

```bash
yarn build-studio
```

> publish the plugin
1. In plugins/studio's package.json, manually update the version number

2. Ensure you are logged into NPM
```bash
npm login
```

3. Go to plugins folder
```bash
cd plugins/studio
```

3. Build the plugin
```bash
yarn build
```

4. Publish the plugin
```bash
npm publish
```