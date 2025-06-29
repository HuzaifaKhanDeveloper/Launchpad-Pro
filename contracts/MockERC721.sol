// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC721 is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
        Ownable(msg.sender)
    {}

    function mint(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter++;
        _mint(to, tokenId);
    }

    function publicMint() external {
        uint256 tokenId = _tokenIdCounter++;
        _mint(msg.sender, tokenId);
    }
}
