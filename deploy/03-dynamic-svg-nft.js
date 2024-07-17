const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config.js")
const { verify } = require("../utils/verify.js")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const EthPriceAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthPriceAggregator.target
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const lowSvg = await fs.readFileSync(
        "/home/cmax/Desktop/Blockchain/hardhat-nft/images/dynamicNft/frown.svg",
        { encoding: "utf8" },
    )
    const highSvg = await fs.readFileSync(
        "/home/cmax/Desktop/Blockchain/hardhat-nft/images/dynamicNft/happy.svg",
        { encoding: "utf8" },
    )

    const args = [ethUsdPriceFeedAddress, lowSvg, highSvg]
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("------------------------------------")
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynamicSvgNft.address, args)
    }
}

module.exports.tags = ["all", "dynamicSvgNft", "main"]
