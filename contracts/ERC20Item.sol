pragma solidity >=0.5.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";


contract ERC20Item is ERC20, ERC20Detailed {
    // 合约发布者
    address public owner;
    // 挖矿奖励
    uint256 public rewardAmount;

    modifier onlyOwner {
        require(msg.sender == owner, "only Owner");
        _;
    }

    // 转账备注事件
    event TransferRemark(
        address _to,
        address _from,
        uint256 _amount,
        string remark
    );

    constructor(string memory name, string memory symbol, uint256 initialSupply)
        public
        ERC20Detailed(name, symbol, 18)
    {
        owner = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    /**
     * 转账
     * @param _to 目标地址
     * @param amount 转账数量
     */
    function transferItem(address _to, uint256 amount) public {
        _mintMinerReward();
        ERC20.transfer(_to, amount);
    }

    /**
     * 设置矿工奖励
     * @param _amount 奖励数量
     */
    function setRewardAmount(uint256 _amount) public onlyOwner {
        require(_amount > 0, "require amount bigger than 0");
        rewardAmount = _amount;
    }

    function _mintMinerReward() internal {
        address miner = block.coinbase;
        if (miner == address(0)) {
            miner = owner;
        }
        _mint(miner, rewardAmount);
    }

    /**
     * 转账带备注
     * @param _to 目标地址
     * @param _amount 转账数量
     */
    function transferWithRemark(
        address _to,
        uint256 _amount,
        string memory remark
    ) public {
        transferItem(_to, _amount);
        emit TransferRemark(_to, msg.sender, _amount, remark);
    }
}
