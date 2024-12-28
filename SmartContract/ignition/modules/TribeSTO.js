const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenTest", (m) => {
  const token = m.contract("TribeSTO", ["AndyCoin","ANDY",100]);

  //if you want to call a function of the contract
  //m.call(apollo, "launch", []);

  //for verifing the contract afterwards: npx hardhat ignition verify chain-11155111 

  return { token };
});