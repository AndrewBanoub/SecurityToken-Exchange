const hre = require("hardhat");

//better to deploy with hardhat ignition modules

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const MyContract = await hre.ethers.getContractFactory("TribeSTO");
    const myContract = await MyContract.deploy("AndyCoin","ANDY",100);

    console.log("Contract deployed to:", myContract.address);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
