// SPDX-License-Identifier: MIT
pragma solidity ^ 0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./SamuraiAndRonin.sol";
import "./YEN.sol";

contract MarketPlace is Ownable, IERC721Receiver {

    // uint8 constant IS_USER = 0;
    uint8 constant IS_RESELLER = 1;
    uint8 constant IS_CREATOR = 2;

    struct SaleInfo {
        uint256 tokenId;
        address creator;
        address currentOwner;
        uint256 startPrice;
        address maxBidder;
        uint256 maxBid;
        uint256 startTime;
        uint256 interval;
        bool _isOnSale;
    }

    enum AuctionState { 
        OPEN,
        CANCELLED,
        ENDED,
        DIRECT_BUY
    }

    event PlaceBid(address bidder, uint bid);
    event PerformBid(address nftSeller, address nftBuyer, uint256 amount);
    event DestroySale(uint256 tokenId);

    address mkOwner;
    address snraddress;
    SamuraiAndRonin snr;
    YEN yen;

    uint _saleIdCounter;
    bool _status;

    mapping(uint => SaleInfo) _allSaleInfo;
    mapping(uint256 => uint) _getSaleId;
    mapping(uint256 => bool) _tokenIdExists;
    mapping(address => uint8) _isCreator;
    mapping(address => uint256) _mintingFees;
    // mapping(address => uint24) _sellingRatio;
    uint256 saleFee = 10;
    uint256 royaltyFee = 10;

    modifier onlyAdmin() {
        require(_isCreator[msg.sender] == IS_CREATOR || mkOwner == msg.sender, "Not NFT creater...");
        _;
    }

    modifier onlyReseller() {
        require(_isCreator[msg.sender] == IS_RESELLER || _isCreator[msg.sender] == IS_CREATOR || mkOwner == msg.sender, "Not NFT reseller...");
        _;
    }

    modifier notOnlyNFTOwner(uint256 _tokenId) {
        require(_allSaleInfo[_tokenId].currentOwner != msg.sender, "NFT Owner cannot bid...");
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
        snraddress = _nftAddress;
        yen = YEN(_spcAddress);
        _saleIdCounter = 0;
        _status = false;
    }

    function createSale(uint256 _tokenId, uint _interval, uint _startPrice) public nonReentrant onlyReseller returns (bool) {
        require(_interval >= 0, "Invalid auction interval....");
        // require(_tokenIdExists[_tokenId], "Non-Existing NFT hash value....");
        require(snr.ownerOf(_tokenId) == _msgSender(), "You didn't own this token");

        SaleInfo memory saleInfo;

        snr.transferFrom(msg.sender, address(this), _tokenId);
        address creator;
        if (_allSaleInfo[_tokenId].creator != address(0)) {
            creator = _allSaleInfo[_tokenId].creator;
        } else {
            creator = msg.sender;
        }
        saleInfo = SaleInfo(_tokenId, msg.sender, msg.sender, _startPrice, address(0), 0, block.timestamp, _interval, true);

        _allSaleInfo[_tokenId] = saleInfo;
        // _getSaleId[_tokenId] = _saleIdCounter;
        _saleIdCounter++;
        
        return true;
    }

    function destroySale(uint256 _tokenId) external onlyReseller nonReentrant returns (bool) {
        // require(_tokenIdExists[_tokenId], "Non-Existing NFT hash value....");
        // require(getAuctionState(_tokenId) != AuctionState.CANCELLED, "Auction state is already cancelled...");
        SaleInfo storage saleInfo = _allSaleInfo[_tokenId];
        require(saleInfo.currentOwner == msg.sender, "You didn't upload this token to market place");
        require(saleInfo._isOnSale == true, "this token is not avaliable");
        require(saleInfo.startTime + saleInfo.interval < block.timestamp, "You can cancel sale only before auction done");
        
        uint256 safeFeeAmount = saleInfo.startPrice * saleFee / 100;
        require(yen.balanceOf(msg.sender) >= safeFeeAmount, "You should pay sale fee");

        if (saleInfo.maxBid != 0) {
            yen.transfer(saleInfo.maxBidder, saleInfo.maxBid);
            saleInfo.maxBidder == address(0);
            saleInfo.maxBid = 0;
        }
        
        yen.burn(msg.sender, safeFeeAmount);
        snr.transferFrom(address(this), saleInfo.currentOwner, _tokenId);
        saleInfo.currentOwner = address(0);
        saleInfo._isOnSale = false;
        
        emit DestroySale(_tokenId);

        return true;
    }

    function placeBid(uint256 _tokenId, uint256 _amount) external nonReentrant notOnlyNFTOwner(_tokenId) returns (bool) {
        // require(_tokenIdExists[_tokenId], "Non-Existing NFT hash value....");
        // require(getAuctionState(_tokenId) == AuctionState.OPEN || getAuctionState(_tokenId) == AuctionState.DIRECT_BUY, "Auction state is not open...");
        
        SaleInfo storage saleInfo = _allSaleInfo[_tokenId];
        require(saleInfo._isOnSale == true, "Invalid token Id");
        require(_amount >= saleInfo.startPrice, "Starting price is too low...");
        require(_amount > saleInfo.maxBid, "You should bit with over max bid price");
        require(saleInfo.startTime + saleInfo.interval < block.timestamp, "Auction has already done.");

        yen.transferFrom(msg.sender, address(this), _amount);
        
        if (saleInfo.maxBid > 0) {
            yen.transfer(saleInfo.maxBidder, saleInfo.maxBid);
        }
        saleInfo.maxBid = _amount;
        saleInfo.maxBidder = msg.sender;

        emit PlaceBid(msg.sender, _amount);
        
        return true;
    }

    function performBid(uint256 _tokenId) external nonReentrant returns (bool) {
        SaleInfo storage saleInfo = _allSaleInfo[_tokenId];
        require(saleInfo._isOnSale == true, "Invalid token Id");
        require(saleInfo.maxBidder != address(0), "There should be at least one bidder");
        if (saleInfo.startTime + saleInfo.interval > block.timestamp) {
            require(saleInfo.currentOwner == msg.sender || msg.sender == saleInfo.maxBidder, "Both NFT owner and Max Bidder can call this function after action done");
        } else {
            require(saleInfo.currentOwner == msg.sender, "Only NFT owner can call this function before auction done");
        }
        
        uint256 royaltyAmount = saleInfo.maxBid * royaltyFee / 100;
        uint256 saleFeeAmount = saleInfo.maxBid * saleFee / 100;
        uint256 salePrice = saleInfo.maxBid - saleFeeAmount - royaltyAmount;

        snr.transferFrom(address(this), saleInfo.maxBidder, _tokenId);

        yen.transfer(saleInfo.creator, royaltyAmount);
        yen.burn(address(this), saleFeeAmount);
        yen.transfer(saleInfo.currentOwner, salePrice);

        address bidder = saleInfo.maxBidder;
        saleInfo._isOnSale = false;
        saleInfo.maxBidder = address(0);

        emit PerformBid(saleInfo.currentOwner, bidder, saleInfo.maxBid);

        return true;
    }

    // function getAuthentication(address _addr) external view returns (uint8) {
    //     require(_addr != address(0), "Invalid input address...");
    //     return _isCreator[_addr];
    // }

    // function getAuctionState(uint256 _tokenId) public view returns (AuctionState) {
    //     if (!_allSaleInfo[_tokenId]._isOnSale) return AuctionState.CANCELLED;
    //     if (_allSaleInfo[_tokenId].interval == 0) return AuctionState.DIRECT_BUY;
    //     if (block.timestamp >= _allSaleInfo[_tokenId].startTime + _allSaleInfo[_tokenId].interval) return AuctionState.ENDED;
    //     return AuctionState.OPEN;
    // } 

    function getSaleInfo(uint256 _tokenId) public view returns (SaleInfo memory) {
        require(_tokenIdExists[_tokenId], "Non-Existing NFT hash value....");

        return _allSaleInfo[_tokenId];
    }

    // function getWithdrawBalance(uint8 _kind) public view returns (uint256) {
    //     require(_kind >= 0, "Invalid cryptocurrency...");

    //     if (_kind == 0) {
    //       return address(this).balance;
    //     } else {
    //       return yen.balanceOf(address(this));
    //     }
    // }

    // function setOwner(address payable _newOwner) external onlyOwner {
    //     require(_newOwner != address(0), "Invalid input address...");
    //     mkOwner = _newOwner;
    //     transferOwnership(mkOwner);
    // }

    // function setAuthentication(address _addr, uint8 _flag) external onlyOwner {
    //     require(_addr != address(0), "Invalid input address...");
    //     _isCreator[_addr] = _flag;
    // }

    // function setMintingFee(address _creater, uint256 _amount) external onlyOwner {
    //     require(_creater != address(0), "Invalid input address...");
    //     require(_amount >= 0, "Too small amount");
    //     _mintingFees[_creater] = _amount;
    // }

    // function setSellingFee(address _seller, uint24 _ratio) external onlyOwner {
    //     require(_seller != address(0), "Invalid input address...");
    //     require(_ratio >= 0, "Too small ratio");
    //     require(_ratio < 100, "Too large ratio");
    //     _sellingRatio[_seller] = _ratio;
    // }

    function setSaleFee(uint256 _fee) external onlyOwner {
        require(_fee >= 0, "saleFee should be over 0%");
        require(_fee < 100, "saleFee should be less than 100%");
        saleFee = _fee;
    }

    function setRoyaltyFee(uint256 _fee) external onlyOwner {
        require(_fee >= 0, "royaltyFee should be over 0%");
        require(_fee < 100, "royaltyFee should be less than 100%");
        royaltyFee = _fee;
    }


    // function withDraw(uint256 _amount, uint8 _kind) external onlyOwner {
    //     require(_amount > 0, "Invalid withdraw amount...");
    //     require(_kind >= 0, "Invalid cryptocurrency...");
    //     require(getWithdrawBalance(_kind) > _amount, "None left to withdraw...");

    //     yen.transfer(msg.sender, _amount);
    // }

    // function withDrawAll(uint8 _kind) external onlyOwner {
    //     require(_kind >= 0, "Invalid cryptocurrency...");
    //     uint256 remaining = getWithdrawBalance(_kind);
    //     require(remaining > 0, "None left to withdraw...");

    //     yen.transfer(msg.sender, remaining);
    // }

    // receive() payable external {
    // }

    // fallback() payable external {
    // }

    function onERC721Received(
        address,
        address from,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        require(from == address(0x0), "Cannot send tokens to Lord directly");
        return IERC721Receiver.onERC721Received.selector;
    }
}