const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Exchange", (m) => {
    //hardhat network contract = "0x205Cfc23ef26922E116135500abb4B12Ab6d4668"
    //sepolia "0xBBc4cC73032afA19c4F90c8afEB3B31850F9aA90"
  const Exchange = m.contract("Exchange", ["0x5FbDB2315678afecb367f032d93F642f64180aa3"]);

  //if you want to call a function of the contract
  //m.call(apollo, "launch", []);

  //for verifing the contract afterwards: npx hardhat ignition verify chain-11155111 

  return { Exchange };
});