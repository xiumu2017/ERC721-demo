var ERC20Item = artifacts.require("ERC20Item");
// var ERC20Wallet = artifacts.require("ERC20Wallet");

module.exports = function (deployer) {
    // deployment steps
    deployer.deploy(ERC20Item, "TESLA", "TES", 60000);
    // deployer.deploy(ERC20Wallet);
};