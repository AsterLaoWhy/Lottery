const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let raffle, raffleEntranceFee, deployer

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
              raffle = await ethers.getContract("Raffle")
          })

          describe("fulfillRandomWords", function () {
              isCallTrace(
                  "Works with live chainlink, and we get a random winner",
                  async function () {
                      //Enter Raffle
                      const startingTimeStamp = await raffle.getLatestTimeStamp()
                      await new Promise(async (reject) => {
                          raffle.once("WinnerPicked", async () => {
                              console.log("Winner Pick event fired")
                              try {
                                  //add asserts
                                  const recentWinner = await raffle.getRecentWinner()
                                  const raffleState = await raffle.getRaffleState()
                                  const endingTimeStamp = await raffle.getLastTimeStamp()
                                  const winnerBalance = await accounts[0].getBalance()

                                  await expect(raffle.getPlayer(0)).to.be.reverted
                                  assert.equal(recentWinner.toString(), accounts[0].address)
                                  assert.equal(raffleState, 0)
                                  assert.equal(
                                      winnerBalance.toString(),
                                      winnerStartingBalance.add(raffleEntranceFee).toString()
                                  )
                                  assert(endingTimeStamp > startingTimeStamp)
                                  resolve()
                              } catch (error) {
                                  console.log(error)
                                  reject(e)
                              }
                          })
                          await raffle.enterRaffle({ value: raffleEntranceFee })
                          const winnerStartingBalance = await accounts[0].getBalance()
                      })
                  }
              )
          })
      })
