# Staking-Token

- In this project user can mint tokens by paying ETH, 100000 tokens per ETH, the ETH transfers to the owner who deployed the smart contract, you can double the amount of tokens by staking in just 7 days

- The smart contract is deployed [here](https://sepolia.etherscan.io/address/0x65D8fB910AB69d655b1B9e7367367Ba5766c958E)

- You can get the dapp [here](https://lucky-kringle-5d896b.netlify.app/)

## Technologies Used

- solidity compiler version : 0.8.9

- [Hardhat](https://hardhat.org/) smart contracts architecture

- [OpenZeppelin](https://www.openzeppelin.com/) contracts

- [chai](https://www.chaijs.com/) for testing

## A typical top-level directory layout

├── artifacts # deployed addresses and the ABI of the smart contract

├── contracts # smart contracts solidity files

├── scripts # deployment scripts

├── test # test scripts

├── .env # environment variables template

├── .gitignore

├── hardhat-config.js # hardhat configuration

├── package.json # project details and dependencies

├── README.md

## Installation

1. Clone this repo:

```console
git clone git@github.com:ArunLohmod/staking-token.git
```

2. Install NPM packages:

```console
cd staking-token
npm install
```

## Deployment

- Create the .env file and fill in `ALCHEMY_API_KEY` and `PRIVATE_KEY`. The values for the `ALCHEMY_API_KEY` can be obtained from the [Alchemy](https://www.alchemy.com/) website. If you don't have an account, you can create one for free.

- ### Compile the smart contracts

  This will compile the smart contract files using the specified soilidity compiler in `hardhat.config.js`.

  ```console
  npx hardhat compile
  ```

- ### Run tests:

```console
npx hardhat test
```

- ### Deploy Contract

```console
  npx hardhat run .\scripts\deploy.js --network <NETWORK>
```

- `<NETWORK>` can be `localhost`, `sepolia`, `mainnet` or any other network that is supported and defined in the `hardhat.config.js`.
