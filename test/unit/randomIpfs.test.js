
const { assert, expect } = require("chai")
const { network, ethers, getNamedAccounts, deployments } = require("hardhat")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Ipfs Nft", async function () {
          let randomIpfs, vrfCoordinatorV2Mock, deployer
          beforeEach(async function () {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["mocks", "randomNft"])
              randomIpfs = await ethers.getContract("RandomIpfsNft", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
          })

          describe("constructor", function () {
              it("initialises the contract correctly", async function () {
                  const dogTokenUri = await randomIpfs.getTokenUri(0)
                  assert.equal(dogTokenUri.includes("ipfs://"), true)
              })
          })
          describe("requestNft", function () {
              it("reverts if the payments is failed ", async function () {
                  await expect(randomIpfs.requestNft()).to.be.revertedWithCustomError(
                      randomIpfs,
                      "RandomIpfsNft__NeedMoreEthSent",
                  )
              })
              it("reverts if the paymetns amount is less then the mint fee", async function () {
                  const fee = await randomIpfs.getMintFee()
                  await expect(
                      randomIpfs.requestNft({ value: fee - ethers.parseEther("0.001") }),
                  ).to.be.revertedWithCustomError(randomIpfs, "RandomIpfsNft__NeedMoreEthSent")
              })
              it("emits an event and kicks off a random word request", async function () {
                  const fee = await randomIpfs.getMintFee()
                  await expect(randomIpfs.requestNft({ value: fee.toString() })).to.emit(
                      randomIpfs,
                      "NftRequested",
                  )
              })
          })
          describe("fulfillRandomWords", function () {
              it("mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfs.once("NftMinted", async (tokenId, breed, minter) => {
                          try {
                              const tokenUri = await randomIpfs.s_dogTokenUris(tokenId.toString())
                              const tokenCounter = await randomIpfs.getTokenCounter()
                              const dogUri = await randomIpfs.getTokenUri(breed.toString())
                              assert.equal(tokenUri.toString().includes("ipfs://"), true)
                              assert.equal(dogUri.toString(), tokenUri.toString())
                              assert.equal(+tokenCounter.toString(), +tokenId.toString() + 1)
                              assert.equal(minter, deployer)
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomIpfs.getMintFee()
                          const requestNftResponse = await randomIpfs.requestNft({
                              value: fee.toString(),
                          })
                          const requestNftReceipt = await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.logs[1].args.requestId,
                              randomIpfs.target,
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })
          describe("getBreedFromModdedRng",()=>{
              it("should return pug if moddedRng < 10",async function(){
                const expectedValue = await randomIpfs.getBreedFromModdedRng(5)
                assert.equal(0,expectedValue)
              })
              it("should return shiba-inu if moddedRng is between 10-39",async function(){
                const expectedValue = await randomIpfs.getBreedFromModdedRng(21)
                assert.equal(1,expectedValue)
              })
              it("should return st. bernard id moddedRng is between 40-99",async function(){
                const expectedValue = await randomIpfs.getBreedFromModdedRng(70)
                assert.equal(2,expectedValue)
              })
              it("should revert if moddedRng > 99",async function(){
                await expect(randomIpfs.getBreedFromModdedRng(100)).to.be.revertedWithCustomError(
                    randomIpfs,
                    "RandomIpfsNft_RangeOutOfBounds",
                )
              })    
          })
      })
