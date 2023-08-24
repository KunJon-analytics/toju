// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TojuToken is ERC20, Ownable {
    uint256 public immutable i_max_supply;

    constructor(uint256 max_supply) ERC20("Toju", "TOJU") {
        i_max_supply = max_supply;
    }

    function mint() public payable {
        require(msg.value >= 10000000 gwei, "TOJU: insufficient token sent");
        require(i_max_supply > totalSupply(), "TOJU: Tokens fully emitted");
        _mint(_msgSender(), 1000 ether);
    }

    function withdrawTokens() external onlyOwner {
        (bool success, ) = payable(_msgSender()).call{
            value: address(this).balance
        }("");
        require(success);
    }

    receive() external payable {
        mint();
    }

    fallback() external {
        // Handle the fallback logic, but don't receive Ether
    }
}
