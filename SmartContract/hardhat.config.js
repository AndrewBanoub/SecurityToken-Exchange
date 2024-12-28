require("@nomicfoundation/hardhat-toolbox");

//from me
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  etherscan: {
    apiKey: `${process.env.ETHER_SCAN}`
  },
  //from me too
  /*
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.API_KEY}`,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    }
  }
  //from me
  networks: {
    hardhat: {
      forking: {
        url : `https://mainnet.infura.io/v3/${process.env.API_KEY}`
      }
    }
  }*/
  networks:{
    hardhat:{},
    localhost: {
      url: "http://127.0.0.1:8545",
      allowUnlimitedContractSize: true
    }
  }

};
