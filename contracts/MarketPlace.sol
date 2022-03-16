// SPDX-License-Identifier: MIT
pragma solidity ^ 0.8.10;


import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SamuraiAndRonin.sol";
import "./YEN.sol";

contract MarketPlace is Ownable {

    // uint8 constant IS_USER = 0;
    uint8 constant IS_RESELLER = 1;
    uint8 constant IS_CREATOR = 2;

    struct SaleInfo {
        uint256 tokenId;
        string tokenHash;
        address creator;
        address currentOwner;
        uint256 startPrice;
        address maxBidder;
        uint256 maxBid;
        uint256 startTime;
        uint256 interval;
        uint24 royaltyRatio;
        uint8 kindOfCoin;
        bool _isOnSale;
    }

    enum AuctionState { 
        OPEN,
        CANCELLED,
        ENDED,
        DIRECT_BUY
    }

    address mkOwner;
    address mkNFTaddress;
    SamuraiAndRonin mkNFT;
    YEN SPCToken;

    uint _saleIdCounter;
    bool _status;
    bool _isMinting;

    mapping(uint => SaleInfo) _allSaleInfo;
    mapping(string => uint) _getSaleId;
    mapping(string => bool) _tokenHashExists;
    mapping(address => uint8) _isCreator;
    mapping(address => uint256) _mintingFees;
    mapping(address => uint24) _sellingRatio;

    modifier onlyAdmin() {
        require(_isCreator[msg.sender] == IS_CREATOR || mkOwner == msg.sender, "Not NFT creater...");
        _;
    }

    modifier onlyReseller() {
        require(_isCreator[msg.sender] == IS_RESELLER || _isCreator[msg.sender] == IS_CREATOR || mkOwner == msg.sender, "Not NFT reseller...");
        _;
    }

    modifier notOnlyNFTOwner(string memory _tokenHash) {
        require(_allSaleInfo[_getSaleId[_tokenHash]].currentOwner != msg.sender, "NFT Owner cannot bid...");
        _;
    }

    modifier nonReentrant() {
        require(_status != true, "ReentrancyGuard: reentrant call");
        _status = true;
        _;
        _status = false;
    }

    constructor(address _nftAddress, address _spcAddress) {
        mkOwner = msg.sender;
        mkNFTaddress = _nftAddress;
        SPCToken = YEN(_spcAddress);
        _saleIdCounter = 0;
        _status = false;
        _isMinting = false;
    }

    function mintSingleNFT(string memory _tokenHash) internal {
        require(!_tokenHashExists[_tokenHash], "Existing NFT hash value....");
        mkNFT = SamuraiAndRonin(mkNFTaddress);
        mkNFT.mintNFT(_tokenHash);
        _tokenHashExists[_tokenHash] = true;
        _isMinting = true;
    }

    function mintMultipleNFT(string[] memory _tokenHashs) internal {
        for (uint256 i = 0; i < _tokenHashs.length; i++) {
            require(!_tokenHashExists[_tokenHashs[i]], "Existing NFT hash value....");
            mkNFT = SamuraiAndRonin(mkNFTaddress);
            mkNFT.mintNFT(_tokenHashs[i]);
            _tokenHashExists[_tokenHashs[i]] = true;
        }
        _isMinting = true;
    }

    function createSale(string memory _tokenHash, uint _interval, uint _startPrice, uint24 _royalty, uint8 _kind) public nonReentrant onlyReseller returns (bool) {
        require(_interval >= 0, "Invalid auction interval....");
        require(_royalty >= 0, "Invalid royalty value....");
        require(_tokenHashExists[_tokenHash], "Non-Existing NFT hash value....");

        SaleInfo memory saleInfo;

        if (!_isMinting) {
            mkNFT.tranferNFT(msg.sender, address(this), _tokenHash);
            saleInfo = SaleInfo(_saleIdCounter, _tokenHash, _allSaleInfo[_getSaleId[_tokenHash]].creator, msg.sender, _startPrice, address(0), 0, block.timestamp, _interval, _royalty, _kind, true);
        } else {
            saleInfo = SaleInfo(_saleIdCounter, _tokenHash, msg.sender, msg.sender, _startPrice, address(0), 0, block.timestamp, _interval, _royalty, _kind, true);
        }
              
        _allSaleInfo[_saleIdCounter] = saleInfo;
        _getSaleId[_tokenHash] = _saleIdCounter;
        _saleIdCounter++;
        return true;
    }

    function createBatchSale(string[] memory _tokenHashs, uint _startPrice, uint24 _royalty, uint8 _kind) public {
        for (uint256 i = 0; i < _tokenHashs.length; i++) {
            createSale(_tokenHashs[i], 0, _startPrice, _royalty, _kind);
        }
    }

    function singleMintOnSale(string memory _tokenHash, uint _interval, uint _startPrice, uint24 _royalty, uint8 _kind) external payable onlyAdmin {
        mintSingleNFT(_tokenHash);
        createSale(_tokenHash, _interval, _startPrice, _royalty, _kind);
        _isMinting = false;
    }

    function batchMintOnSale(string[] memory _tokenHashs, uint _startPrice, uint24 _royalty, uint8 _kind) external payable onlyAdmin {
        mintMultipleNFT(_tokenHashs);
        createBatchSale(_tokenHashs, _startPrice, _royalty, _kind);
        _isMinting = false;
    }

    function destroySale(string memory _tokenHash) external onlyReseller nonReentrant returns (bool) {
        require(_tokenHashExists[_tokenHash], "Non-Existing NFT hash value....");
        require(getAuctionState(_tokenHash) != AuctionState.CANCELLED, "Auction state is already cancelled...");

        if (_allSaleInfo[_getSaleId[_tokenHash]].maxBid != 0) {
            customizedTransfer(payable(_allSaleInfo[_getSaleId[_tokenHash]].maxBidder), _allSaleInfo[_getSaleId[_tokenHash]].maxBid, _allSaleInfo[_getSaleId[_tokenHash]].kindOfCoin);
        }

        mkNFT.tranferNFT(address(this), _allSaleInfo[_getSaleId[_tokenHash]].currentOwner, _tokenHash);
        _allSaleInfo[_getSaleId[_tokenHash]]._isOnSale = false;
        emit DestroySale(_tokenHash);
        return true;
    }

    function placeBid(string memory _tokenHash) payable external nonReentrant notOnlyNFTOwner(_tokenHash) returns (bool) {
        require(_tokenHashExists[_tokenHash], "Non-Existing NFT hash value....");
        require(getAuctionState(_tokenHash) == AuctionState.OPEN || getAuctionState(_tokenHash) == AuctionState.DIRECT_BUY, "Auction state is not open...");
        require(msg.value >= _allSaleInfo[_getSaleId[_tokenHash]].startPrice, "Starting price is too low...");

        if (_allSaleInfo[_getSaleId[_tokenHash]].kindOfCoin > 0) {
            SPCToken.transferFrom(msg.sender, address(this), msg.value);
        }

        address lastHightestBidder = _allSaleInfo[_getSaleId[_tokenHash]].maxBidder;
        uint256 lastHighestBid = _allSaleInfo[_getSaleId[_tokenHash]].maxBid;
        _allSaleInfo[_getSaleId[_tokenHash]].maxBid = msg.value;
        _allSaleInfo[_getSaleId[_tokenHash]].maxBidder = msg.sender;

        if (lastHighestBid != 0) {
            customizedTransfer(payable(lastHightestBidder), lastHighestBid, _allSaleInfo[_getSaleId[_tokenHash]].kindOfCoin);
        }
    
        emit PlaceBid(msg.sender, msg.value);
        
        return true;
    } 

    function performBid(string memory _tokenHash) external nonReentrant returns (bool) {
        require(_tokenHashExists[_tokenHash], "Non-Existing NFT hash value....");
        require(getAuctionState(_tokenHash) == AuctionState.OPEN || getAuctionState(_tokenHash) == AuctionState.ENDED || getAuctionState(_tokenHash) == AuctionState.DIRECT_BUY, "Auction state is not correct...");
        SaleInfo memory saleInfo = _allSaleInfo[_getSaleId[_tokenHash]];
        uint256 royaltyAmount = saleInfo.maxBid * saleInfo.royaltyRatio / 100;
        uint256 salePrice = saleInfo.maxBid - saleInfo.maxBid * _sellingRatio[saleInfo.currentOwner] / 100 - royaltyAmount;

        mkNFT.tranferNFT(address(this), saleInfo.maxBidder, _tokenHash);

        customizedTransfer(payable(saleInfo.creator), royaltyAmount, saleInfo.kindOfCoin);
        customizedTransfer(payable(saleInfo.currentOwner), salePrice, saleInfo.kindOfCoin);

        saleInfo.currentOwner = saleInfo.maxBidder;
        saleInfo.startPrice = saleInfo.maxBid;
        saleInfo._isOnSale = false;

        _allSaleInfo[_getSaleId[_tokenHash]] = saleInfo;

        emit PerformBid(msg.sender, saleInfo.maxBidder, saleInfo.maxBid);
        return true;
    }

    function getAuthentication(address _addr) external view returns (uint8) {
        require(_addr != address(0), "Invalid input address...");
        return _isCreator[_addr];
    }

    function getAuctionState(string memory _tokenHash) public view returns (AuctionState) {
        if (!_allSaleInfo[_getSaleId[_tokenHash]]._isOnSale) return AuctionState.CANCELLED;
        if (_allSaleInfo[_getSaleId[_tokenHash]].interval == 0) return AuctionState.DIRECT_BUY;
        if (block.timestamp >= _allSaleInfo[_getSaleId[_tokenHash]].startTime + _allSaleInfo[_getSaleId[_tokenHash]].interval) return AuctionState.ENDED;
        return AuctionState.OPEN;
    } 

    function getSaleInfo(string memory _tokenHash) public view returns (SaleInfo memory) {
        require(_tokenHashExists[_tokenHash], "Non-Existing NFT hash value....");

        return _allSaleInfo[_getSaleId[_tokenHash]];
    }

    function getWithdrawBalance(uint8 _kind) public view returns (uint256) {
        require(_kind >= 0, "Invalid cryptocurrency...");

        if (_kind == 0) {
          return address(this).balance;
        } else {
          return SPCToken.balanceOf(address(this));
        }
    }

    function setOwner(address payable _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid input address...");
        mkOwner = _newOwner;
        transferOwnership(mkOwner);
    }

    function setAuthentication(address _addr, uint8 _flag) external onlyOwner {
        require(_addr != address(0), "Invalid input address...");
        _isCreator[_addr] = _flag;
    }

    function setMintingFee(address _creater, uint256 _amount) external onlyOwner {
        require(_creater != address(0), "Invalid input address...");
        require(_amount >= 0, "Too small amount");
        _mintingFees[_creater] = _amount;
    }

    function setSellingFee(address _seller, uint24 _ratio) external onlyOwner {
        require(_seller != address(0), "Invalid input address...");
        require(_ratio >= 0, "Too small ratio");
        require(_ratio < 100, "Too large ratio");
        _sellingRatio[_seller] = _ratio;
    }

    function customizedTransfer(address payable _to, uint256 _amount, uint8 _kind) internal {
        require(_to != address(0), "Invalid address...");
        require(_amount >= 0, "Invalid transferring amount...");
        require(_kind >= 0, "Invalid cryptocurrency...");
        
        if (_kind == 0) {
          _to.transfer(_amount);
        } else {
          SPCToken.transfer(_to, _amount);
        }
    }

    function withDraw(uint256 _amount, uint8 _kind) external onlyOwner {
        require(_amount > 0, "Invalid withdraw amount...");
        require(_kind >= 0, "Invalid cryptocurrency...");
        require(getWithdrawBalance(_kind) > _amount, "None left to withdraw...");

        customizedTransfer(payable(msg.sender), _amount, _kind);
    }

    function withDrawAll(uint8 _kind) external onlyOwner {
        require(_kind >= 0, "Invalid cryptocurrency...");
        uint256 remaining = getWithdrawBalance(_kind);
        require(remaining > 0, "None left to withdraw...");

        customizedTransfer(payable(msg.sender), remaining, _kind);
    }

    receive() payable external {

    }

    fallback() payable external {

    }

    event PlaceBid(address bidder, uint bid);
    event PerformBid(address nftSeller, address nftBuyer, uint256 amount);
    event DestroySale(string tokenHash);
    // event Withdraw(address to, uint256 amount, uint8 kind);
    // event WithdrawAll(address to, uint8 kind);
}