// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.0;

import "./Lord.sol";

interface ILord {
    function addManyToLord(address account, uint16[] calldata tokenIds) external;
    function randomSamuraiOwner(uint256 seed) external view returns (address);
    function lord(uint256) external view returns(uint16, uint80, address);
    function totalYenEarned() external view returns(uint256);
    function lastClaimTimestamp() external view returns(uint256);
    function setOldTokenInfo(uint256 _tokenId) external;

    function pack(uint256, uint256) external view returns(Lord.Stake memory);
    function packIndices(uint256) external view returns(uint256);

}