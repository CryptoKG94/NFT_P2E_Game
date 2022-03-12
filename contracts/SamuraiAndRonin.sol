// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./ISamuraiAndRonin.sol";
import "./ILord.sol";
import "./ITraits.sol";
import "./IYEN.sol";
import "./ISeed.sol";

contract SamuraiAndRonin is ISamuraiAndRonin, ERC721Enumerable, Ownable, Pausable {

    // mint price
    uint256 public MINT_PRICE = 65 ether;
    uint256 public MINT_PRICE_WL = 50 ether;

    uint256 public MAX_MINT = 30;
    // max number of tokens that can be minted - 50000 in production
    uint256 public immutable MAX_TOKENS = 30000; // 30k
    // number of tokens that can be claimed for free - 33.3% of MAX_TOKENS
    uint256 public PAID_TOKENS;
    // number of tokens have been minted so far
    uint16 public minted;

    uint256 public prepaymentPercentForSale = 10; // 10% prepayment for listing

    // mapping from tokenId to a struct containing the token's traits
    mapping(uint256 => RoninSamurai) public tokenTraits;
    // mapping from hashed(tokenTrait) to the tokenId it's associated with
    // used to ensure there are no duplicates
    mapping(uint256 => uint256) public existingCombinations;
    // reference to the Lord for choosing random Samurai thieves
    ILord public lord;
    // reference to $YEN for burning on mint
    IYEN public yen;
    // reference to Traits
    ITraits public traits;

    ISeed public randomSource;

    bool private _reentrant = false;
    bool private stakingActive = true;

    mapping(address => bool) isWhitelist;
    mapping(address => bool) isFreelist;

    modifier nonReentrant() {
        require(!_reentrant, "No reentrancy");
        _reentrant = true;
        _;
        _reentrant = false;
    }

    /**
     * instantiates contract and rarity tables
     */
    constructor(IYEN _yen, ITraits _traits) ERC721("Samurai Game", 'WGAME') {
        yen = _yen;
        traits = _traits;

        // MAX_TOKENS = 30000;
        PAID_TOKENS = 10000;
    }

    function setRandomSource(ISeed _seed) external onlyOwner {
        randomSource = _seed;
    }

    function burn(uint256 tokenId) external whenNotPaused {
        _burn(tokenId);
    }

    /***EXTERNAL */

    /**
     * mint a token - 90% Ronin, 10% Samurais
     * The first 33% are free to claim, the remaining cost $YEN
     */
    function mint(uint256 amount, bool stake) external payable nonReentrant whenNotPaused {
        require(!stake || stakingActive, "Staking not activated");

        require(tx.origin == _msgSender(), "Only EOA");
        require(minted + amount <= MAX_TOKENS, "All tokens minted");
        require(amount > 0 && amount <= MAX_MINT, "Invalid mint amount");

        uint256 mintPrice = isWhitelist[_msgSender()] ? MINT_PRICE_WL : MINT_PRICE;
        mintPrice = isFreelist[_msgSender()] ? 0 : mintPrice;

        if (minted < PAID_TOKENS) {
            require(minted + amount <= PAID_TOKENS, "All tokens on-sale already sold");
            require(amount * mintPrice == msg.value, "Invalid payment amount");
        } else {
            require(msg.value == 0);
        }

        uint256 totalYenCost = 0;
        uint16[] memory tokenIds = new uint16[](amount);
        address[] memory owners = new address[](amount);
        uint256 seed;
        uint256 firstMinted = minted;

        for (uint i = 0; i < amount; i++) {
            minted++;
            seed = random(minted);
            randomSource.update(minted ^ seed);
            generate(minted, seed);
            address recipient = selectRecipient(seed);
            totalYenCost += mintCost(minted);
            if (!stake || recipient != _msgSender()) {
                owners[i] = recipient;
            } else {
                tokenIds[i] = minted;
                owners[i] = address(lord);
            }
        }

        if (totalYenCost > 0) yen.burn(_msgSender(), totalYenCost);

        for (uint i = 0; i < owners.length; i++) {
            uint id = firstMinted + i + 1;
            if (!stake || owners[i] != _msgSender()) {
                _safeMint(owners[i], id);
            }
        }
        if (stake) lord.addManyToLord(_msgSender(), tokenIds);
    }

    /**
     * the first 33.3% are paid in FTM
     * the next 33.3% are 20000 $YEN
     * the next 33.3% are 40000 $YEN
     * @param tokenId the ID to check the cost of to mint
   * @return the cost of the given token ID
   */
    function mintCost(uint256 tokenId) public view returns (uint256) {
        if (tokenId <= PAID_TOKENS) return 0;
        if (tokenId <= MAX_TOKENS * 2 / 3) return 20000 ether;
        return 40000 ether;
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override nonReentrant {
        // Hardcode the Lord's approval so that users don't have to waste gas approving
        if (_msgSender() != address(lord))
            require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _transfer(from, to, tokenId);
    }

    /***INTERNAL */

    /**
     * generates traits for a specific token, checking to make sure it's unique
     * @param tokenId the id of the token to generate traits for
   * @param seed a pseudorandom 256 bit number to derive traits from
   * @return t - a struct of traits for the given token ID
   */
    function generate(uint256 tokenId, uint256 seed) internal returns (RoninSamurai memory t) {
        t = selectTraits(seed);
        if (existingCombinations[structToHash(t)] == 0) {
            tokenTraits[tokenId] = t;
            existingCombinations[structToHash(t)] = tokenId;
            return t;
        }
        return generate(tokenId, random(seed));
    }

    /**
     * uses A.J. Walker's Alias algorithm for O(1) rarity table lookup
     * ensuring O(1) instead of O(n) reduces mint cost by more than 50%
     * probability & alias tables are generated off-chain beforehand
     * @param seed portion of the 256 bit seed to remove trait correlation
   * @param traitType the trait type to select a trait for
   * @return the ID of the randomly selected trait
   */
    function selectTrait(uint16 seed, uint8 traitType) internal view returns (uint8) {
        return traits.selectTrait(seed, traitType);
    }

    /**
     * the first 33% (ETH purchases) go to the minter
     * the remaining 67% have a 10% chance to be given to a random staked Samurai
     * @param seed a random value to select a recipient from
   * @return the address of the recipient (either the minter or the Samurai Ronin's owner)
   */
    function selectRecipient(uint256 seed) internal view returns (address) {
        if (minted <= PAID_TOKENS || ((seed >> 245) % 10) != 0) return _msgSender();
        // top 10 bits haven't been used
        address ronin = lord.randomSamuraiOwner(seed >> 144);
        // 144 bits reserved for trait selection
        if (ronin == address(0x0)) return _msgSender();
        return ronin;
    }

    /**
     * selects the species and all of its traits based on the seed value
     * @param seed a pseudorandom 256 bit number to derive traits from
   * @return t -  a struct of randomly selected traits
   */
    function selectTraits(uint256 seed) internal view returns (RoninSamurai memory t) {
        t.isRonin = (seed & 0xFFFF) % 10 != 0;
        uint8 shift = t.isRonin ? 0 : 10;

        seed >>= 16;
        t.uniform = selectTrait(uint16(seed & 0xFFFF), 0 + shift);

        seed >>= 16;
        t.hair = selectTrait(uint16(seed & 0xFFFF), 1 + shift);

        seed >>= 16;
        t.facialHair = selectTrait(uint16(seed & 0xFFFF), 2 + shift);

        seed >>= 16;
        t.eyes = selectTrait(uint16(seed & 0xFFFF), 3 + shift);

        seed >>= 16;
        t.accessory = selectTrait(uint16(seed & 0xFFFF), 4 + shift);

        seed >>= 16;
        t.headgear = selectTrait(uint16(seed & 0xFFFF), 5 + shift);

        seed >>= 16;
        if (!t.isRonin) {
            t.neckGear = selectTrait(uint16(seed & 0xFFFF), 6 + shift);
            t.alphaIndex = selectTrait(uint16(seed & 0xFFFF), 7 + shift);
        }
    }

    /**
     * converts a struct to a 256 bit hash to check for uniqueness
     * @param s the struct to pack into a hash
   * @return the 256 bit hash of the struct
   */
    function structToHash(RoninSamurai memory s) internal pure returns (uint256) {
        return uint256(keccak256(
                abi.encodePacked(
                    s.isRonin,
                    s.uniform,
                    s.hair,
                    s.facialHair,
                    s.eyes,
                    s.headgear,
                    s.accessory,
                    s.neckGear,
                    s.alphaIndex
                )
            ));
    }

    /**
     * generates a pseudorandom number
     * @param seed a value ensure different outcomes for different sources in the same block
   * @return a pseudorandom value
   */
    function random(uint256 seed) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
                tx.origin,
                blockhash(block.number - 1),
                block.timestamp,
                seed
            ))) ^ randomSource.seed();
    }

    /***READ */

    function getTokenTraits(uint256 tokenId) external view override returns (RoninSamurai memory) {
        return tokenTraits[tokenId];
    }

    function getPaidTokens() external view override returns (uint256) {
        return PAID_TOKENS;
    }

    /***ADMIN */

    /**
     * called after deployment so that the contract can get random Samurai Ronins
     * @param _lord the address of the Lord
   */
    function setLord(address _lord) external onlyOwner {
        lord = ILord(_lord);
    }

    /**
     * allows owner to withdraw funds from minting
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * updates the number of tokens for sale
     */
    function setPaidTokens(uint256 _paidTokens) external onlyOwner {
        PAID_TOKENS = _paidTokens;
    }

    /**
     * enables owner to pause / unpause minting
     */
    function setPaused(bool _paused) external onlyOwner {
        if (_paused) _pause();
        else _unpause();
    }

    /***RENDER */

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return traits.tokenURI(tokenId);
    }

    function changePrice(uint256 _price, uint8 _index) public onlyOwner {
        if (_index == 0) { // general price
            MINT_PRICE = _price;
        } else {            // whitelist price
            MINT_PRICE_WL = _price;
        }
    }

    function setStakingActive(bool _staking) public onlyOwner {
        stakingActive = _staking;
    }

    function setTraits(ITraits addr) public onlyOwner {
        traits = addr;
    }

    function setWhitelist(address _depositor, bool _value) external onlyOwner {
        isWhitelist[_depositor] = _value;
    }

    function toggleWhitelist(address[] memory _depositors) external onlyOwner {
        for (uint256 i = 0; i < _depositors.length; i++) {
            isWhitelist[_depositors[i]] = !isWhitelist[_depositors[i]];
        }
    }

    function setFreelist(address _depositor, bool _value) external onlyOwner {
        isFreelist[_depositor] = _value;
    }

    function toggleFreelist(address[] memory _depositors) external onlyOwner {
        for (uint256 i = 0; i < _depositors.length; i++) {
            isFreelist[_depositors[i]] = !isFreelist[_depositors[i]];
        }
    }

    function setPriceForSale(
        uint256 _tokenId,
        uint256 _newPrice,
        bool isForSale
    ) external {
        require(_exists(_tokenId), "token not found");
        address tokenOwner = ownerOf(_tokenId);
        require(tokenOwner == msg.sender, "not owner");
        uint256 prepayment = prepaymentPercentForSale * _newPrice / 100;
        require(yen.balanceOf(_msgSender()) > prepayment, "You should invest at least 10% of price for listing");
        yen.burn(_msgSender(), prepayment);

        RoninSamurai memory roninSamurai = tokenTraits[_tokenId];
        roninSamurai.price = _newPrice;
        roninSamurai.forSale = isForSale;
        tokenTraits[_tokenId] = roninSamurai;
        // emit SaleToggle(_tokenId, isForSale, _newPrice);
    }

    function buyNFT(uint256 _tokenId, uint256 _amount) external override returns (bool) {
        // check if the token id of the token being bought exists or not
        require(_exists(_tokenId));
        // get the token's owner
        address tokenOwner = ownerOf(_tokenId);
        // token's owner should not be an zero address account
        require(tokenOwner != address(0));
        // the one who wants to buy the token should not be the token's owner
        require(tokenOwner != msg.sender);
        // get that token from all tokenTraits mapping and create a memory of it defined as (struct => tokenTraits)
        RoninSamurai memory roninSamurai = tokenTraits[_tokenId];
        // price sent in to buy should be equal to or more than the token's price
        require(_amount >= roninSamurai.price);
        // token should be for sale
        require(roninSamurai.forSale);
        uint256 payOwnerAmount = _amount * (100 - prepaymentPercentForSale) / 100;
        yen.transferFrom(_msgSender(), tokenOwner, payOwnerAmount);
        roninSamurai.price = _amount;
        roninSamurai.forSale = false;
        tokenTraits[_tokenId] = roninSamurai;
        _transfer(tokenOwner, msg.sender, _tokenId);
        
        return true;
    }

    // ADMIN: drop NFT to the winners
    function airdropNFT(uint256 from, uint256 to) external onlyOwner {
        // mint 1 NFT to every owners
        for (uint256 i = from; i <= to; i++) {
            address tokenOwner = ownerOf(i);
            if (tokenOwner != address(0)) {
                minted++;
                _safeMint(tokenOwner, minted);
            }
        }
    }

    // ADMIN: drop YEN to the NFT holders 
    function airdropYEN(uint256 from, uint256 to, uint256 amount) external onlyOwner {
        // mint amount $YEN to every owners
        for (uint256 i = from; i <= to; i++) {
            address tokenOwner = ownerOf(i);
            if (tokenOwner != address(0)) {
                yen.transfer(tokenOwner, amount);
            }
        }
    }
}