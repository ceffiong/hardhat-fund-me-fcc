// import
// main function
// calling of main function

const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// function deployFunc(hre) {
//     console.log("Hello fundme!")
// }

// module.exports.default = deployFunc

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        //get the address of just deployed contract
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    //if the contract doesn't exist, we deplay a minimal version

    //what happens when we want to change chains?
    //when going for localhost or hardhat network we want to use a mock

    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log(`FundMe deployed at ${fundMe.address}`)

    //verify on test network not localhost
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
    log("-------------------------------------------------------")
}
module.exports.tags = ["all", "fundme"]
