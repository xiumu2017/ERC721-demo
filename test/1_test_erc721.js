const ERC721Item = artifacts.require("ERC721Item");

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

contract("ERC721Item", accounts => {

    let itemContract;
    let owner = accounts[0];
    let user1 = accounts[1];
    let user2 = accounts[2];

    beforeEach(async () => {
        itemContract = await ERC721Item.new();
    });

    it("TestCase1: 增发代币，查询总量", async () => {
        let baseUri = await itemContract.baseURI();
        console.log("baseURI: " + baseUri);
        // 新增 token
        await itemContract.addToken(owner, "TokenTest1", "TokenTest1_desc", "TT1");

        let total = await itemContract.totalSupply();
        assert.equal(total, 1, "查询总量不正确")
    })

    it("TestCase2: 查询持有的代币列表", async () => {
        // 新增 token
        await itemContract.addToken(user1, "TokenTest1", "TokenTest1_desc", "TT1");
        await itemContract.addToken(user1, "TokenTest2", "TokenTest2_desc", "TT2");

        let res = await itemContract.queryOwnerTokenIds(user1, { from: user1 });
        assert.equal(res.length, 2, "查询代币列表不正确");
        if (res && res.length > 0) {
            res.forEach(item => {
                itemContract.queryTokenInfo(item, { from: user1 }).then(tokenInfo => {
                    console.log(tokenInfo);
                });

            })
        }
    })

    it("TestCase3: 转赠代币", async () => {
        // 新增 token
        await itemContract.addToken(user1, "TokenTest1", "TokenTest1_desc", "TT1");
        await itemContract.addToken(user1, "TokenTest2", "TokenTest2_desc", "TT2");
        let r1 = await itemContract.queryOwnerTokenIds(user1, { from: user1 });
        console.log(">>> 转赠前user1 tokens >>>");
        console.log(r1);
        await itemContract.transfer(user2, r1[0], { from: user1 });

        let r2 = await itemContract.queryOwnerTokenIds(user1, { from: user1 });
        console.log(">>> 转赠后user1 tokens >>>");
        console.log(r2);

        let res = await itemContract.queryOwnerTokenIds(user2, { from: user2 });
        console.log(">>> 转赠后user2 tokens >>>");
        console.log(res);
        if (res && res.length > 0) {
            res.forEach(item => {
                itemContract.queryTokenInfo(item, { from: user2 }).then(tokenInfo => {
                    console.log(tokenInfo);
                    assert.equal(tokenInfo['0'], "TokenTest1", "转赠数据异常");
                });

            })
        }

    })
    it("TestCase4: 吊销代币", async () => {
        // 新增 token
        await itemContract.addToken(user1, "TokenTest1", "TokenTest1_desc", "TT1");
        await itemContract.addToken(user1, "TokenTest2", "TokenTest2_desc", "TT2");
        let total = await itemContract.totalSupply();
        console.log("total1:" + total);
        assert.equal(total, 2, "查询总量不正确")
        let rr = await itemContract.queryOwnerTokenIds(user1, { from: owner });
        await itemContract.burn(rr[0]);
        total = await itemContract.totalSupply();
        console.log("total2:" + total);
        assert.equal(total, 1, "吊销异常");
    })
});