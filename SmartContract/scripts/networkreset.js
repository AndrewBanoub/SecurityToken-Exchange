const { ethers, network } = require("hardhat");

async function main() {
  console.log("Resetting Hardhat network...");

  // Call the `hardhat_reset` RPC method
  await network.provider.send("hardhat_reset");

  console.log("Hardhat network has been reset.");

  // Verify the reset by checking the block number and signer balances
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log(`Block number after reset: ${blockNumber}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
