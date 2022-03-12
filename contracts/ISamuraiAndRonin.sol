// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.0;

interface ISamuraiAndRonin {

    // struct to store each token's traits
    struct RoninSamurai {
        bool isRonin;
        uint8 uniform;
        uint8 hair;
        uint8 eyes;
        uint8 facialHair;
        uint8 headgear;
        uint8 neckGear;
        uint8 accessory;
        uint8 alphaIndex;

        bool forSale;
        uint256 price;
    }

    function getPaidTokens() external view returns (uint256);
    function getTokenTraits(uint256 tokenId) external view returns (RoninSamurai memory);
    function buyNFT(uint256 _tokenId, uint256 _amount) external returns (bool);
}