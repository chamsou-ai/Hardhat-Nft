# NFT Project with Hardhat and Solidity

## Overview

This project demonstrates the creation of three types of NFTs using Hardhat and Solidity:
1. **DynamicSvgNft** - An NFT that generates its SVG image dynamically.
2. **RandomIpfsNft** - An NFT that fetches its image from IPFS, with the image being chosen randomly.
3. **BasicNft** - A simple, basic NFT.

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Smart Contracts](#smart-contracts)
  - [DynamicSvgNft](#dynamicsvgnft)
  - [RandomIpfsNft](#randomipfsnft)
  - [BasicNft](#basicnft)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This repository contains smart contracts and scripts to create and manage NFTs on the Ethereum blockchain. The NFTs are created using Solidity and Hardhat. The project includes:
- **DynamicSvgNft**: Generates an SVG image dynamically on-chain.
- **RandomIpfsNft**: Fetches images from IPFS, selecting one randomly.
- **BasicNft**: A basic implementation of an NFT.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14.x or later)
- [yarn](https://yarnpkg.com/) (version 1.22.x or later)
- [Git](https://git-scm.com/)
- [Hardhat](https://hardhat.org/)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/chamsou-ai/Hardhat-Nft.git
    cd Hardhat-Nft
    ```

2. Install dependencies:
    ```bash
    yarn install
    ```

## Usage

To interact with the contracts and deploy them to a local blockchain, follow these steps:

1. Start Hardhat local node:
    ```bash
    yarn hardhat node
    ```

2. Deploy contracts:
    ```bash
    yarn hardhat run deploy --tags main --network localhost
    ```

3. Run tests:
    ```bash
    yarn hardhat test
    ```

## Smart Contracts

### DynamicSvgNft

This contract generates an SVG image dynamically on-chain. The SVG data is stored directly in the contract, and the image can be customized based on the input parameters.

### RandomIpfsNft

This contract fetches images from IPFS and assigns them to the NFTs. The image is chosen randomly from a predefined list of IPFS hashes.

### BasicNft

A simple NFT contract that implements the ERC721 standard. It allows minting of basic NFTs with unique IDs and metadata.

## Deployment

To deploy the contracts to a live network:

1. Configure your network settings in `hardhat.config.js`.
2. Run the deploy script with the desired network:
    ```bash
    yarn hardhat run deploy --network sepolia
    ```

## Testing

To run the tests for the contracts, use the following command:
    ```bash
    yarn hardhat test
    ```
The test suite includes unit tests for each contract to ensure their functionality and correctness.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
