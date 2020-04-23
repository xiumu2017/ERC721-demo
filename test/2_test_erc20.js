const ERC20Item = artifacts.require("ERC20Item");
// const ERC20Wallet = artifacts.require("ERC20Wallet");

var sleep = function (time) {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

var expectError = async function (errStr, fun, ...params) {
    let error = null;
    try {
        await fun.apply(null, params);
    } catch (e) {
        error = e.toString();
    }
    expect(error).to.have.string(errStr);
}

contract("ERC20Item", accounts => {

    let itemContract1;
    let itemContract2;
    let owner = accounts[0];
    let user1 = accounts[1];
    let user2 = accounts[2];

    beforeEach(async () => {
        itemContract1 = await ERC20Item.new("T1", "TPQ", 1000000);
        itemContract2 = await ERC20Item.new("T2", "QQB", 80000);
    });

    it("TestCase1: 查询代币信息", async () => {
        let total1 = await itemContract1.totalSupply();
        let total2 = await itemContract2.totalSupply();
        let name1 = await itemContract1.name();
        let name2 = await itemContract2.name();
        console.log(name1);
        console.log(name2);
        assert.equal(total1, 1000000, "查询总量1不正确");
        assert.equal(total2, 80000, "查询总量2不正确");
    })

    it("TestCase2: 查询代币余额", async () => {
        console.log(">>> before");
        let balance = await itemContract1.balanceOf(owner);
        console.log("owner代币余额：" + balance);
        await itemContract1.transferItem(user1, 99);

        console.log(">>> after");
        let b2 = await itemContract1.balanceOf(user1);
        console.log("user1代币余额：" + b2);
        let b3 = await itemContract1.balanceOf(owner);
        console.log("owner代币余额：" + b3);


        await itemContract1.transferWithRemark(user2, 199,"zzz");
        console.log(">>> after tr");
        let b4 = await itemContract1.balanceOf(user2);
        console.log("user2代币余额：" + b4);
        let b5 = await itemContract1.balanceOf(owner);
        console.log("owner代币余额：" + b5);
    })
});