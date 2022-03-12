// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./SamuraiAndRonin.sol";
import "./YEN.sol";

contract Lord is Ownable, IERC721Receiver, Pausable {

    // maximum alpha score for a Samurai
    uint8 public constant MAX_ALPHA = 8;

    // struct to store a stake's token, owner, and earning values
    struct Stake {
        uint16 tokenId;
        uint80 value;
        address owner;
    }

    struct Merchant {
        address owner;
        uint80 portions;
        uint80 crossBowsRonin;
        uint80 crossBowsSamurai;
        uint80 shields;
    }

    event TokenStaked(address owner, uint256 tokenId, uint256 value);
    event RoninClaimed(uint256 tokenId, uint256 earned, bool unstaked);
    event SamuraiClaimed(uint256 tokenId, uint256 earned, bool unstaked);

    // reference to the SamuraiAndRonin NFT contract
    SamuraiAndRonin game;
    // reference to the $YEN contract for minting $YEN earnings
    YEN yen;

    // maps tokenId to stake
    mapping(uint256 => Stake) public lord;
    // maps alpha to all Samurai stakes with that alpha
    mapping(uint256 => Stake[]) public pack;
    // tracks location of each Samurai in Pack
    mapping(uint256 => uint256) public packIndices;

    mapping(address => Merchant) public merchants;

    // total alpha scores staked
    uint256 public totalAlphaStaked = 0;
    // any rewards distributed when no samurais are staked
    uint256 public unaccountedRewards = 0;
    // amount of $YEN due for each alpha point staked
    uint256 public yenPerAlpha = 0;

    // ronin earn 10000 $YEN per day
    uint256 public DAILY_YEN_RATE = 10000 ether;
    // ronin must have 3 days worth of $YEN to unstake or else it's too cold
    uint256 public MINIMUM_TO_EXIT = 3 days;
    uint256 public MINIMUM_TO_EXIT_USEPORTION = 1 days;
    // samurais take a 20% tax on all $YEN claimed
    uint256 public constant YEN_CLAIM_TAX_PERCENTAGE = 20;
    uint256 public constant YEN_CLAIM_TAX_PERCENTAGE_SM = 10;
    uint256 public constant YEN_UNSTAKE_TAX_PERCENTAGE = 25;
    uint256 public constant YEN_UNSTAKE_TAX_PERCENTAGE_SM = 25;
    // there will only ever be (roughly) 2.5 billion $YEN earned through staking
    uint256 public constant MAXIMUM_GLOBAL_YEN = 2500000000 ether;

    uint256 public constant PORTION_PRICE = 7500 ether;
    uint256 public constant CROSSBOW_PRICE_RONIN = 7000 ether;
    uint256 public constant CROSSBOW_PRICE_SAMURAI = 8750 ether;
    uint256 public constant SHIELD_PRICE = 1000 ether;

    // amount of $YEN earned so far
    uint256 public totalYenEarned;
    // number of Ronin staked in the Lord
    uint256 public totalRoninStaked;
    // the last time $YEN was claimed
    uint256 public lastClaimTimestamp;

    // emergency rescue to allow unstaking without any checks but without $YEN
    bool public rescueEnabled = false;

    bool private _reentrant = false;

    modifier nonReentrant() {
        require(!_reentrant, "No reentrancy");
        _reentrant = true;
        _;
        _reentrant = false;
    }

    /**
     * @param _game reference to the SamuraiAndRonin NFT contract
   * @param _yen reference to the $YEN token
   */
    constructor(SamuraiAndRonin _game, YEN _yen) {
        game = _game;
        yen = _yen;
    }

    /***STAKING */

    /**
     * adds Ronin and Samurais to the Lord and Pack
     * @param account the address of the staker
   * @param tokenIds the IDs of the Ronin and Samurais to stake
   */
    function addManyToLord(address account, uint16[] calldata tokenIds) external nonReentrant {
        require((account == _msgSender() && account == tx.origin) || _msgSender() == address(game), "DONT GIVE YOUR TOKENS AWAY");

        for (uint i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == 0) {
                continue;
            }

            if (_msgSender() != address(game)) {// dont do this step if its a mint + stake
                require(game.ownerOf(tokenIds[i]) == _msgSender(), "AINT YO TOKEN");
                game.transferFrom(_msgSender(), address(this), tokenIds[i]);
            }

            if (isRonin(tokenIds[i]))
                _addRoninToLord(account, tokenIds[i]);
            else
                _addSamuraiToLord(account, tokenIds[i]);
        }
    }

    /**
     * adds a single Ronin to the Lord
     * @param account the address of the staker
   * @param tokenId the ID of the Ronin to add to the Lord
   */
    function _addRoninToLord(address account, uint256 tokenId) internal whenNotPaused _updateEarnings {
        lord[tokenId] = Stake({
            owner : account,
            tokenId : uint16(tokenId),
            value : uint80(block.timestamp)
        });
        totalRoninStaked += 1;
        emit TokenStaked(account, tokenId, block.timestamp);
    }

    /**
     * adds a single Samurai to the Lord
     * @param account the address of the staker
   * @param tokenId the ID of the Samurai to add to the Lord
   */
    function _addSamuraiToLord(address account, uint256 tokenId) internal {
        uint256 alpha = _alphaForSamurai(tokenId);
        totalAlphaStaked += alpha;
        // Portion of earnings ranges from 8 to 5
        packIndices[tokenId] = pack[alpha].length;
        // Store the location of the samurai in the Pack
        // pack[alpha].push(Stake({
        //     owner : account,
        //     tokenId : uint16(tokenId),
        //     value : uint80(yenPerAlpha)
        // }));
        lord[tokenId] = Stake({
            owner : account,
            tokenId : uint16(tokenId),
            value : uint80(block.timestamp)
        });
        // Add the samurai to the Pack
        emit TokenStaked(account, tokenId, yenPerAlpha);
    }

    /***CLAIMING / UNSTAKING */

    /**
     * realize $YEN earnings and optionally unstake tokens from the Lord / Pack
     * to unstake a Ronin it will require it has 3 days worth of $YEN unclaimed
     * @param tokenIds the IDs of the tokens to claim earnings from
   * @param unstake whether or not to unstake ALL of the tokens listed in tokenIds
   */
    function claimManyFromLord(uint16[] calldata tokenIds, bool unstake) external nonReentrant whenNotPaused _updateEarnings {
        require(msg.sender == tx.origin, "Only EOA");
        uint256 owed = 0;
        for (uint i = 0; i < tokenIds.length; i++) {
            if (isRonin(tokenIds[i]))
                owed += _claimRoninFromLord(tokenIds[i], unstake);
            else
                owed += _claimSamuraiFromLord(tokenIds[i], unstake);
        }
        if (owed == 0) return;

        Merchant storage userInfo = merchants[_msgSender()];
        if (userInfo.crossBowsRonin > 0) {
            owed = owed * 125 / 100;
            userInfo.crossBowsRonin = userInfo.crossBowsRonin - 1;
        }
        yen.transfer(_msgSender(), owed);
    }

    /**
     * realize $YEN earnings for a single Ronin and optionally unstake it
     * earns 10.000 $YEN a day when staked
     * if not unstaking, pay a 20% tax to be burn
     * if unstaking, there is a 25% tax to be burn and 30.000 $YEN is needed in order to unstake  
     * @param tokenId the ID of the Ronin to claim earnings from
   * @param unstake whether or not to unstake the Ronin
   * @return owed - the amount of $YEN earned
   */
    function _claimRoninFromLord(uint256 tokenId, bool unstake) internal returns (uint256 owed) {
        Stake memory stake = lord[tokenId];
        require(stake.owner == _msgSender(), "SWIPER, NO SWIPING");
        bool usePortion = true;
        if (usePortion == true) {
            require(!(unstake && block.timestamp - stake.value < MINIMUM_TO_EXIT_USEPORTION), "You should noe unstake without one day's YEN in the case of useing portion");
        } else {
            require(!(unstake && block.timestamp - stake.value < MINIMUM_TO_EXIT), "You should noe unstake without three day's YEN in the case of useing portion");
        }
        if (totalYenEarned < MAXIMUM_GLOBAL_YEN) {
            owed = (block.timestamp - stake.value) * DAILY_YEN_RATE / 1 days;
        } else if (stake.value > lastClaimTimestamp) {
            owed = 0;
            // $YEN production stopped already
        } else {
            owed = (lastClaimTimestamp - stake.value) * DAILY_YEN_RATE / 1 days;
            // stop earning additional $YEN if it's all been earned
        }
        bool useCrossbow = true;
        if(useCrossbow) {
            owed = owed * 125 / 100;
        }
        if (unstake) {
            Merchant memory userInfo = merchants[stake.owner];
            uint256 yenUnstakeTaxPecent = YEN_UNSTAKE_TAX_PERCENTAGE;
            if (userInfo.portions > 0) {
                yenUnstakeTaxPecent = yenUnstakeTaxPecent / 2;
            }

            uint256 taxFee = owed * yenUnstakeTaxPecent / 100;
            yen.burn(address(this), taxFee);
            // percentage tax to staked samurais
            owed = owed * (100 - yenUnstakeTaxPecent) / 100;

            game.transferFrom(address(this), _msgSender(), tokenId);
            // send back Ronin
            delete lord[tokenId];
            totalRoninStaked -= 1;
        } else {
            // _paySamuraiTax(owed * YEN_CLAIM_TAX_PERCENTAGE / 100);
            uint256 taxFee = owed * YEN_CLAIM_TAX_PERCENTAGE / 100;
            yen.burn(address(this), taxFee);
            // percentage tax to staked samurais
            owed = owed * (100 - YEN_CLAIM_TAX_PERCENTAGE) / 100;
            // remainder goes to Ronin owner
            lord[tokenId] = Stake({
                owner : _msgSender(),
                tokenId : uint16(tokenId),
                value : uint80(block.timestamp)
            });
            // reset stake
        }
        emit RoninClaimed(tokenId, owed, unstake);
    }

    /**
        * realize $YEN earnings for a single Samurai and optionally unstake it
        *	A5 earns: 12.500 $YEN a day when staked.
        *	A6 earns: 15.000 $YEN a day when staked.
        *	A7 earns: 17.500 $YEN a day when staked.
        *	A8 earns: 20.000 $YEN a day when staked.
        * if not unstaking, pay a 10% tax to be burn
        * if unstaking, there is a 25% tax to be burn and doesn’t need any required amount to unstake for samurai
        * @param tokenId the ID of the Ronin to claim earnings from
    * @param unstake whether or not to unstake the Ronin
    * @return owed - the amount of $YEN earned
    */
    function _claimSamuraiFromLord(uint256 tokenId, bool unstake) internal returns (uint256 owed) {
        Stake memory stake = lord[tokenId];
        require(stake.owner == _msgSender(), "SWIPER, NO SWIPING");

        uint256 alpha = _alphaForSamurai(tokenId);
        uint256 dailyYenRate = DAILY_YEN_RATE + 2500 * (alpha - 4);
        if (totalYenEarned < MAXIMUM_GLOBAL_YEN) {
            owed = (block.timestamp - stake.value) * dailyYenRate / 1 days;
        } else if (stake.value > lastClaimTimestamp) {
            owed = 0;
            // $YEN production stopped already
        } else {
            owed = (lastClaimTimestamp - stake.value) * dailyYenRate / 1 days;
            // stop earning additional $YEN if it's all been earned
        }
        if (unstake) {
            uint256 taxFee = owed * YEN_UNSTAKE_TAX_PERCENTAGE_SM / 100;
            yen.burn(address(this), taxFee);
            // percentage tax to staked samurais
            owed = owed * (100 - YEN_UNSTAKE_TAX_PERCENTAGE_SM) / 100;

            game.transferFrom(address(this), _msgSender(), tokenId);
            // send back Ronin
            delete lord[tokenId];
            // totalRoninStaked -= 1;
            totalAlphaStaked -= alpha;
        } else {
            // _paySamuraiTax(owed * YEN_CLAIM_TAX_PERCENTAGE / 100);
            uint256 taxFee = owed * YEN_CLAIM_TAX_PERCENTAGE_SM / 100;
            yen.burn(address(this), taxFee);
            // percentage tax to staked samurais
            owed = owed * (100 - YEN_CLAIM_TAX_PERCENTAGE_SM) / 100;
            // remainder goes to Ronin owner
            lord[tokenId] = Stake({
                owner : _msgSender(),
                tokenId : uint16(tokenId),
                value : uint80(block.timestamp)
            });
            // reset stake
        }
        emit SamuraiClaimed(tokenId, owed, unstake);
    }


    /**
     * emergency unstake tokens
     * @param tokenIds the IDs of the tokens to claim earnings from
   */
    function rescue(uint256[] calldata tokenIds) external nonReentrant {
        require(rescueEnabled, "RESCUE DISABLED");
        uint256 tokenId;
        Stake memory stake;
        Stake memory lastStake;
        uint256 alpha;
        for (uint i = 0; i < tokenIds.length; i++) {
            tokenId = tokenIds[i];
            if (isRonin(tokenId)) {
                stake = lord[tokenId];
                require(stake.owner == _msgSender(), "SWIPER, NO SWIPING");
                game.transferFrom(address(this), _msgSender(), tokenId);
                // send back Ronin
                delete lord[tokenId];
                totalRoninStaked -= 1;
                emit RoninClaimed(tokenId, 0, true);
            } else {
                alpha = _alphaForSamurai(tokenId);
                stake = pack[alpha][packIndices[tokenId]];
                require(stake.owner == _msgSender(), "SWIPER, NO SWIPING");
                totalAlphaStaked -= alpha;
                // Remove Alpha from total staked
                game.transferFrom(address(this), _msgSender(), tokenId);
                // Send back Samurai
                lastStake = pack[alpha][pack[alpha].length - 1];
                pack[alpha][packIndices[tokenId]] = lastStake;
                // Shuffle last Samurai to current position
                packIndices[lastStake.tokenId] = packIndices[tokenId];
                pack[alpha].pop();
                // Remove duplicate
                delete packIndices[tokenId];
                // Delete old mapping
                emit SamuraiClaimed(tokenId, 0, true);
            }
        }
    }

    /***ACCOUNTING */

    /**
     * add $YEN to claimable pot for the Pack
     * @param amount $YEN to add to the pot
   */
    function _paySamuraiTax(uint256 amount) internal {
        if (totalAlphaStaked == 0) {// if there's no staked samurais
            unaccountedRewards += amount;
            // keep track of $YEN due to samurais
            return;
        }
        // makes sure to include any unaccounted $YEN
        yenPerAlpha += (amount + unaccountedRewards) / totalAlphaStaked;
        unaccountedRewards = 0;
    }

    /**
     * tracks $YEN earnings to ensure it stops once 2.5 billion is eclipsed
     */
    modifier _updateEarnings() {
        if (totalYenEarned < MAXIMUM_GLOBAL_YEN) {
            totalYenEarned +=
            (block.timestamp - lastClaimTimestamp)
            * totalRoninStaked
            * DAILY_YEN_RATE / 1 days;
            lastClaimTimestamp = block.timestamp;
        }
        _;
    }

    /***ADMIN */

    function setSettings(uint256 rate, uint256 exit) external onlyOwner {
        MINIMUM_TO_EXIT = exit;
        DAILY_YEN_RATE = rate;
    }

    /**
     * allows owner to enable "rescue mode"
     * simplifies accounting, prioritizes tokens out in emergency
     */
    function setRescueEnabled(bool _enabled) external onlyOwner {
        rescueEnabled = _enabled;
    }

    /**
     * enables owner to pause / unpause minting
     */
    function setPaused(bool _paused) external onlyOwner {
        if (_paused) _pause();
        else _unpause();
    }

    /***READ ONLY */

    /**
     * checks if a token is a Ronin
     * @param tokenId the ID of the token to check
   * @return ronin - whether or not a token is a Ronin
   */
    function isRonin(uint256 tokenId) public view returns (bool ronin) {
        (ronin, , , , , , , , , , ) = game.tokenTraits(tokenId);
    }

    /**
     * gets the alpha score for a Samurai
     * @param tokenId the ID of the Samurai to get the alpha score for
   * @return the alpha score of the Samurai (5-8)
   */
    function _alphaForSamurai(uint256 tokenId) internal view returns (uint8) {
        (, , , , , , , , uint8 alphaIndex, , ) = game.tokenTraits(tokenId);
        return MAX_ALPHA - alphaIndex;
        // alpha index is 0-3
    }

    /**
     * chooses a random Samurai ronin when a newly minted token is stolen
     * @param seed a random value to choose a Samurai from
   * @return the owner of the randomly selected Samurai ronin
   */
    function randomSamuraiOwner(uint256 seed) external view returns (address) {
        if (totalAlphaStaked == 0) return address(0x0);
        uint256 bucket = (seed & 0xFFFFFFFF) % totalAlphaStaked;
        // choose a value from 0 to total alpha staked
        uint256 cumulative;
        seed >>= 32;
        // loop through each bucket of Samurais with the same alpha score
        for (uint i = MAX_ALPHA - 3; i <= MAX_ALPHA; i++) {
            cumulative += pack[i].length * i;
            // if the value is not inside of that bucket, keep going
            if (bucket >= cumulative) continue;
            // get the address of a random Samurai with that alpha score
            return pack[i][seed % pack[i].length].owner;
        }
        return address(0x0);
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
                seed,
                totalRoninStaked,
                totalAlphaStaked,
                lastClaimTimestamp
            ))) ^ game.randomSource().seed();
    }

    function onERC721Received(
        address,
        address from,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        require(from == address(0x0), "Cannot send tokens to Lord directly");
        return IERC721Receiver.onERC721Received.selector;
    }

    function buyPortions(uint80 _amount) external {
        require(yen.balanceOf(_msgSender()) > _amount * PORTION_PRICE, "Not enough Yen amount!");

        yen.burn(_msgSender(), _amount * PORTION_PRICE);
        Merchant storage user = merchants[_msgSender()];
        user.portions = user.portions + _amount;
    }

    function buyCrossBows(uint80 _amount, bool _forRonin) external {
        uint256 price;
        if (_forRonin) {
            price = CROSSBOW_PRICE_RONIN;
        } else {
            price = CROSSBOW_PRICE_SAMURAI;
        }
        require(yen.balanceOf(_msgSender()) > _amount * price, "Not enough Yen amount!");

        yen.burn(_msgSender(), _amount * price);
        Merchant storage user = merchants[_msgSender()];
        if (_forRonin) {
            user.crossBowsRonin = user.crossBowsRonin + _amount; 
        } else {
            user.crossBowsSamurai = user.crossBowsSamurai + _amount; 
        } 
    }
}