const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config.js")
const { verify } = require("../utils/verify.js")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadUriToPinata.js")

const imagesLocation = "/home/cmax/Desktop/Blockchain/hardhat-nft/images/randomNft"

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "cuteness",
            value: 100,
        },
    ],
}
let tokenUri = [
    "ipfs://QmQs4yASJakykKzcUYiJoQEFptCuufghNA3S5J2CkD47tp",
    "ipfs://QmXry9jwWVKfbt6V87Gzd97WJ5LGAmtyWY7znSQXCRysv9",
    "ipfs://QmX5V7Xc31vMfM8tYgrNefix1WCFmiMqpLzjDtk6PgTQd2",
]
const FUND_AMOUNT = "1000000000000000000000"
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    let vrfCoordinatorAddress, subscriptionId, vrfCoordinatorV2Mock

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUri = await handelTokenUri()
    }
    if (chainId == 31337) {
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorAddress = vrfCoordinatorV2Mock.target
        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt = await tx.wait()
        subscriptionId = txReceipt.logs[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinatorAddress"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    log("------------------------------------")

    const args = [
        vrfCoordinatorAddress,
        subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["callbackGasLimit"],
        tokenUri,
        networkConfig[chainId]["mintFee"],
    ]

    const randomIpfs = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (chainId == 31337) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address)
    }

    log("------------------------------------")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIpfs.address, args)
    }
}

async function handelTokenUri() {
    tokenUri = []

    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponsesIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponsesIndex].replace("png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponsesIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        //store the json to pinata
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUri.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token URIs uploaded ! They are :")
    console.log(tokenUri)

    return tokenUri
}

module.exports.tags = ["all", "randomNft", "main"]
