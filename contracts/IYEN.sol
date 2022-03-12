// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.0;

interface IYEN  {

    function burn(address from, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external;
    function balanceOf(address account) external returns (uint256);
}