var ERC20Item = artifacts.require("ERC20Item");
// var ERC20Wallet = artifacts.require("ERC20Wallet");

module.exports = function (deployer) {
    // deployment steps
    deployer.deploy(ERC20Item, "Paradise", "PED", 10000);
    // deployer.deploy(ERC20Wallet);
};