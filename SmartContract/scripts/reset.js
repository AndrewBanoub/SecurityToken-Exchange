const hre = require("hardhat");

async function main() {
    await hre.network.provider.request({
        method: "hardhat_reset",
        params: [],
    });
    console.log("Network reset successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
