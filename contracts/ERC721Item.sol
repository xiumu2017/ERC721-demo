pragma solidity >=0.5.0 <0.7.0;
// pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/drafts/Counters.sol";


contract ERC721Item is ERC721Full {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /**
     * 保存合约创建者地址
     */
    address public admin;
    /**
     * id name map
     */
    mapping(uint256 => string) private _idNameMap;
    mapping(string => uint256) private _nameIdMap;
    /**
     * id desc map
     */
    mapping(uint256 => string) private _idDescMap;

    modifier onlyOwner {
        require(msg.sender == admin, "only Admin");
        _;
    }

    /**
     * 构造函数
     */
    constructor() public ERC721Full("Paradise", "P") {
        admin = msg.sender;
        // super._setBaseURI("");
    }

    /**
     * 查询用户代币列表
     */
    function queryOwnerTokenIds(address owner)
        public
        view
        returns (uint256[] memory)
    {
        if (msg.sender == admin && owner != address(0)) {
            return super._tokensOfOwner(owner);
        } else {
            return super._tokensOfOwner(msg.sender);
        }
    }

    /**
     * 查询代币信息 uri owner
     */
    function queryTokenInfo(uint256 _id)
        public
        view
        returns (string memory, string memory, string memory, address)
    {
        string memory name = _idNameMap[_id];
        string memory desc = _idDescMap[_id];
        string memory uri = this.tokenURI(_id);
        address owner = super.ownerOf(_id);
        return (name, desc, uri, owner);
    }

    /**
     * 增发代币
     * @param _to to address
     * @param _tokenURI tokenURI
     */
    function addToken(
        address _to,
        string memory _name,
        string memory _desc,
        string memory _tokenURI
    ) public onlyOwner returns (uint256) {
        // 权限
        require(msg.sender == admin, "Not Admin");
        require(_nameIdMap[_name] < 1, "Token name already exist");
        _tokenIds.increment();
        uint256 id = _tokenIds.current();

        ERC721Enumerable._mint(_to, id);
        ERC721Metadata._setTokenURI(id, _tokenURI);
        _idNameMap[id] = _name;
        _idDescMap[id] = _desc;
        _nameIdMap[_name] = id;
        return id;
    }

    /**
     * 吊销代币
     */
    function burn(uint256 _id) public onlyOwner {
        ERC721._burn(_id);
    }

    /**
     * 转增代币
     * 1. 代币存在
     * 2. owner == msg.sender
     */
    function transfer(address _to, uint256 _id) public {
        ERC721Enumerable._transferFrom(msg.sender, _to, _id);
    }
}
