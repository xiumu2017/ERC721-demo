import Web3 from "web3";
import metaCoinArtifact from "../../build/contracts/ERC20Item.json";

const App = {
  web3: null,
  account: null,
  meta: null,
  total: 0,
  accountList: [],
  tokenList: [],
  wallet: {},
  isGanache: false,
  contractAddressList: [],

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      console.log(networkId);
      const deployedNetwork = metaCoinArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        metaCoinArtifact.abi,
        deployedNetwork.address
      );
      this.contractAddressList.push(deployedNetwork.address);
      this.modifyContractAddrList();

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      this.accountList = accounts;
      console.log(this.accountList);
      let html = '<option value="">请选择</option>';
      this.accountList.forEach(item => {
        html += '<option value="' + item + '">' + item + '</option>';
      })

      document.getElementById("address").innerHTML = html;
      const { owner, rewardAmount } = this.meta.methods;
      let adminAddr = await owner().call({ from: this.account });
      let reward_amount = await rewardAmount().call({ from: this.account });
      console.log("合约Owner：" + adminAddr);
      console.log("当前矿工奖励数量：" + reward_amount);
      document.getElementById("award_amount").value = reward_amount;
    } catch (error) {
      console.log(error);
      console.error("Could not connect to contract or chain.");
    }
  },
  contractChange: async function () {
    const contractAddr = document.getElementById("contractAddrSelect").value;
    console.log("当前合约地址：" + contractAddr);
    this.meta._address = contractAddr;
    const { name, symbol, totalSupply, balanceOf, rewardAmount } = this.meta.methods;
    let reward_amount = await rewardAmount().call({ from: this.account });
    document.getElementById("award_amount").value = reward_amount;
    name().call({ from: this.account }).then((tokenName) => {
      symbol().call({ from: this.account }).then((tokenSymbol) => {
        totalSupply().call({ from: this.account }).then((tokenTotalSupply) => {
          balanceOf(this.account).call({ from: this.account }).then((balance) => {
            console.log(tokenName);
            console.log(tokenSymbol);
            console.log(tokenTotalSupply);
            console.log(balance);
          })
        })
      })
    });
  },
  switchToGanache: function () {
    this.isGanache = !this.isGanache;
    console.log(this.isGanache);
  },
  // 查询代币列表
  queryTokens: async function () {
    const address = document.getElementById("address").value;
    console.log(address);
    if (!address) {
      alert("请选择地址");
      return;
    }
    // 得到地址的合约列表
    const addrs = this.contractAddressList;
    let tab = document.getElementById("tokenListView");
    // 清空列表
    for (let i = tab.rows.length - 1; i > 0; i--) {
      tab.deleteRow(i);
    }
    // 重新查询赋值
    if (addrs.length > 0) {
      for (let index = 0; index < addrs.length; index++) {
        const element = addrs[index];
        this.dealQuery(element, index);
      }
    }
  },
  dealQuery: async function (item, index) {
    let table = document.getElementById("tokenListView");
    console.log("item: " + item);
    const { web3 } = this;
    let newMeta = new web3.eth.Contract(metaCoinArtifact.abi, item);
    const { name, symbol, totalSupply, balanceOf } = newMeta.methods;
    const tokenName = await name().call({ from: this.account });
    console.log("tokenName" + tokenName);
    const tokenSymbol = await symbol().call({ from: this.account });
    const tokenTotalSupply = await totalSupply().call({ from: this.account });
    const balance = await balanceOf(this.account).call({ from: this.account });

    let tr = document.createElement("tr");
    let tdIndex = document.createElement("td");
    tdIndex.appendChild(document.createTextNode('#' + index++));

    let tdName = document.createElement("td");
    tdName.appendChild(document.createTextNode(tokenName));
    let tdSymbol = document.createElement("td");
    tdSymbol.appendChild(document.createTextNode(tokenSymbol));
    let totalTd = document.createElement("td");
    totalTd.appendChild(document.createTextNode(tokenTotalSupply));
    let balanceTd = document.createElement("td");
    balanceTd.appendChild(document.createTextNode(balance));
    let addrTd = document.createElement("td");
    addrTd.appendChild(document.createTextNode(item));
    tr.appendChild(tdIndex);
    tr.appendChild(tdName);
    tr.appendChild(tdSymbol);
    tr.appendChild(totalTd);
    tr.appendChild(balanceTd);
    tr.appendChild(addrTd);
    table.append(tr);
  },
  // 新增token
  addToken: async function () {
    const contractAddr = document.getElementById("contractAddr").value;
    this.contractAddressList.push(contractAddr);
    this.modifyContractAddrList();
  },
  // transferTo
  transferTo: async function () {
    const { transferWithRemark, transferItem, balanceOf, totalSupply } = this.meta.methods;
    const _to = document.getElementById("_to").value;
    const amount = document.getElementById("amount").value;
    const remark = document.getElementById("remark").value;
    if (!_to || !amount) {
      alert("请完善目标地址和数量");
      return;
    }
    if (!remark) {
      await transferItem(_to, amount).send({ from: this.account, gasLimit: 300000 });
    } else {
      await transferWithRemark(_to, amount, remark).send({ from: this.account, gasLimit: 300000 });
    }
    // 查询当前地址余额
    let fromBalance = await balanceOf(this.account).call({ from: this.account });
    console.log("当前地址余额：" + fromBalance);
    // 查询目标地址余额
    let toBalance = await balanceOf(_to).call({ from: this.account });
    console.log("目标地址余额：" + toBalance);
    // 如果设置了矿工奖励，查询 totalSupply
    let total_supply = await totalSupply().call({ from: this.account });
    console.log("发行总量：" + total_supply);
    document.getElementById("p1").innerText = "当前地址余额：" + fromBalance;
    document.getElementById("p2").innerText = "目标地址余额：" + toBalance
    document.getElementById("p3").innerText = "发行总量：" + total_supply;
  },
  changeAccount: function () {
    this.account = document.getElementById("address").value;
    console.log("currnet account:" + this.account);
  },
  modifyContractAddrList: function () {
    let html = '<option value="">请选择</option>';
    this.contractAddressList.forEach(item => {
      html += '<option value="' + item + '">' + item + '</option>';
    })
    document.getElementById("contractAddrSelect").innerHTML = html;
  },
  setRewardAmount: async function () {
    const { setRewardAmount, rewardAmount } = this.meta.methods;
    const awardAmount = document.getElementById("award_amount").value;
    if (!awardAmount || awardAmount < 1) {
      alert("请输入奖励数量 >0");
      return;
    }
    await setRewardAmount(awardAmount).send({ from: this.account, gasLimit: 300000 })
    let reward_amount = await rewardAmount().call({ from: this.account });
    console.log("当前矿工奖励数量：" + reward_amount);
  }
};

window.App = App;

window.addEventListener("load", function () {
  // if (window.ethereum && !App.isGanache) {
  // use MetaMask's provider
  // App.web3 = new Web3(window.ethereum);
  // window.ethereum.enable(); // get permission to access accounts
  // } else {
  console.warn(
    "No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live",
  );
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  App.web3 = new Web3(
    new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
  );
  // }

  App.start();
});
