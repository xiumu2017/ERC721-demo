import Web3 from "web3";
import metaCoinArtifact from "../../build/contracts/ERC721Item.json";

const App = {
  web3: null,
  account: null,
  meta: null,
  accountList: [],
  total: 0,
  tokenList: [],

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = metaCoinArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        metaCoinArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
      this.accountList = accounts;
      let html = '<option value="">请选择</option>';
      this.accountList.forEach(item => {
        html += '<option value="' + item + '">' + item + '</option>';
      })

      document.getElementById("_toAddr").innerHTML = html;
      document.getElementById("address").innerHTML = html;
      this.queryTotalSupply();

      const { admin } = this.meta.methods;
      let adminAddr = await admin().call({ from: this.account });
      document.getElementById("owner").innerHTML = adminAddr;
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },
  // 查询代币列表
  queryTokenList: async function () {
    const { queryOwnerTokenIds, queryTokenInfo } = this.meta.methods;
    const address = document.getElementById("address").value;
    console.log(address);
    if (!address) {
      alert("请选择地址");
      return;
    }
    const tokenIds = await queryOwnerTokenIds(address).call({ from: this.account });
    console.log("tokenIds: ");
    console.log(tokenIds);

    let tab = document.getElementById("tokenListView");
    for (let i = tab.rows.length - 1; i > 0; i--) {
      tab.deleteRow(i);
    }

    if (tokenIds.length > 0) {
      let table = document.getElementById("tokenListView");
      let index = 1;
      tokenIds.forEach(item => {
        console.log("item: " + item);
        queryTokenInfo(item).call({ from: this.account }).then(info => {
          const name = info[0];
          const desc = info[1];
          const uri = info[2];
          this.tokenList.push({
            'name': name,
            'desc': desc,
            'uri': uri,
            'owner': this.account,
            'id': item
          });
          let tr = document.createElement("tr");
          console.log(tr);
          let tdIndex = document.createElement("td");
          tdIndex.appendChild(document.createTextNode('#' + index++));
          let tdId = document.createElement("td");
          tdId.appendChild(document.createTextNode(item));
          let tdName = document.createElement("td");
          tdName.appendChild(document.createTextNode(name));
          let tdDesc = document.createElement("td");
          tdDesc.appendChild(document.createTextNode(desc));
          let tdUri = document.createElement("td");
          tdUri.appendChild(document.createTextNode(uri));
          let tdOwner = document.createElement("td");
          tdOwner.appendChild(document.createTextNode(this.account));
          tr.appendChild(tdIndex);
          tr.appendChild(tdId);
          tr.appendChild(tdName);
          tr.appendChild(tdDesc);
          tr.appendChild(tdUri);
          tr.appendChild(tdOwner);
          table.append(tr);
        })
      })
    }

  },
  // 查询代币信息
  queryTokenInfoById: async function () {
    const { queryTokenInfo } = this.meta.methods;
    const id = document.getElementById("tokenId").value;
    if (!id) {
      alert("请输入 tokenID");
      return;
    }
    let info = await queryTokenInfo(id).call({ from: this.account });
    console.log("info:>>>");
    console.log(info);
  },
  // 新增token
  addToken: async function () {
    const { addToken } = this.meta.methods;
    const addr = document.getElementById("addr").value;
    const name = document.getElementById("TokenName").value;
    const desc = document.getElementById("TokenDesc").value;
    const uri = document.getElementById("uri").value;
    let item = await addToken(addr, name, desc, uri).send({ from: this.account, gasLimit: 300000 });
    console.log(item);
  },
  // 吊销代币
  burn: async function () {
    const { burn } = this.meta.methods;
    const id = document.getElementById("tokenId").value;
    if (!id) {
      alert("请输入 tokenID");
      return;
    }
    await burn(id).send({ from: this.account });

    this.queryTotalSupply();
    this.queryTokenList();
  },
  // 转增代币
  transfer: async function () {
    const { transfer } = this.meta.methods;
    const id = document.getElementById("tokenId").value;
    if (!id) {
      alert("请输入 tokenID");
      return;
    }
    const _toAddr = document.getElementById("_toAddr").value;
    await transfer(_toAddr, id).send({ from: this.account, gasLimit: 300000 });

    this.queryTokenList();
  },
  queryTotalSupply: async function () {
    const { totalSupply } = this.meta.methods;
    this.total = await totalSupply().call({ from: this.account });
    console.log("total:");
    console.log(this.total);
    document.getElementById("total").innerHTML = "总量：" + this.total;
  },
  queryTokenByIndex: async function () {
    const { tokenByIndex } = this.meta.methods;
    let index = document.getElementById("index").value;
    let tokenId = await tokenByIndex(index).call({ from: this.account });
    console.log("tokenByIndex: ");
    console.log(tokenId);
  },
  changeAccount: function () {
    this.account = document.getElementById("address").value;
    console.log("currnet account:" + this.account);
  }
};

window.App = App;

window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
    );
  }

  App.start();
});
