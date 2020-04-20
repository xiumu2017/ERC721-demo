var ERC721Item = artifacts.require("ERC721Item");

module.exports = function (deployer) {
    // deployment steps
    deployer.deploy(ERC721Item);
};