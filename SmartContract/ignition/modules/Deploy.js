const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenAndExchangeDeployment", (m) => {
    // Deploy the Token contract
    const token = m.contract("TribeSTO",["TribeCoin", "TRIBE", 10000]);

    // Deploy the Exchange contract, passing the Token contract's address as a constructor argument
    const exchange = m.contract("Exchange",[token]);

    return {token, exchange}
});
