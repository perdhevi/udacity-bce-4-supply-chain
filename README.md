# udacity-bce-supply-chain

Udacity BlockChain Supply Chain Project
This is a sample project of supply chain for Udacity project on Blockchain Supply Chain,
The flow is the coffee bean is being tracked from Farmer, Distributor, Retail and Consumer

## The contract address

- 0xC28165EAf89D70eeCB8a1A43fa79aEc5a6f2e65c

## Library used

- I've added the @truffle/hdwallet-provider library for deployment

## Program version numbers 

- Truffle v5.4.7 (core: 5.4.7)
- Solidity v0.5.16 (solc-js)
- Node v12.18.2
- Web3.js v1.5.2

## Review and Installation

Make sure ganache is opened and the account has been added to the metamask
Truffle is installed globally
Port expected is 8545

### contract deployement in test

- Open the main directory run npm install
- run truffle migrate --reset --network develop
- run truffle test to run the test cases

### UI

- In the main directory
- run cd app
- run npm install
- run npm run dev
- open the generated path, normally it should be localhost:8080
- Run the sequence from Harvest -> Process -> Pack -> ForSale
- The Product details phase can be done by the contract owner account or
- in case that it needs to use other account it needs to be registered by the contract owner
  - Popoulate the account in the Retailer/Consumer ID and make sure the active metamask account is the owner account
  - register the account as a retailer/consumer by the contract account
- click Buy -> Ship -> Receive -> Purchase

### UI Notes

- the event will be listed in the Event History

## Notes

the deployment log is located in \docs\log

## Diagrams
### Activity
![activity](https://github.com/perdhevi/udacity-bce-4-supply-chain/blob/main/docs/Activity.drawio.png?raw=true)

### Sequence
![sequence](https://github.com/perdhevi/udacity-bce-4-supply-chain/blob/main/docs/sequence.drawio.png?raw=true)

### State
![state](https://github.com/perdhevi/udacity-bce-4-supply-chain/blob/main/docs/state.drawio.png?raw=true)

### Class
![class](https://github.com/perdhevi/udacity-bce-4-supply-chain/blob/main/docs/class.drawio.png?raw=true)
