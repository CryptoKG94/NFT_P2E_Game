// SPDX-License-Identifier: MIT LICENSE

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YEN is ERC20, Ownable {
    uint256 _initialTotalSupply = 5000000000 * 10 ** 18; // 5.000.000.000
    uint256 teamTokens = 500000000 * 10 ** 18; // 500.000.000

    // a mapping from an address to whether or not it can mint / burn
    mapping(address => bool) controllers;

    constructor() ERC20("YEN", "YEN") { 
        _mint(owner(), _initialTotalSupply);
    }

    /**
     * mints $YEN to a recipient
     * @param to the recipient of the $YEN
   * @param amount the amount of $YEN to mint
   */
    function mint(address to, uint256 amount) external {
        require(controllers[msg.sender], "Only controllers can mint");
        _mint(to, amount);
    }

    /**
     * burns $YEN from a holder
     * @param from the holder of the $YEN
   * @param amount the amount of $YEN to burn
   */
    function burn(address from, uint256 amount) external {
        require(controllers[msg.sender], "Only controllers can burn");
        _burn(from, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(controllers[msg.sender], "Only controllers can burn");

        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    } 

    /**
     * enables an address to mint / burn
     * @param controller the address to enable
   */
    function addController(address controller) external onlyOwner {
        controllers[controller] = true;
    }

    /**
     * disables an address from minting / burning
     * @param controller the address to disbale
   */
    function removeController(address controller) external onlyOwner {
        controllers[controller] = false;
    }
}