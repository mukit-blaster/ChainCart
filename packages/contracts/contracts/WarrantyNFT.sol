// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ChainCart Warranty NFT
/// @notice ERC-721 minted at order fulfillment. Each token represents a
///         transferable warranty linked to an off-chain orderId. The
///         off-chain backend is the sole authorized minter.
contract WarrantyNFT is ERC721, Ownable {
    struct WarrantyData {
        bytes32 productHash;
        bytes32 orderRef;
        uint64 validUntil;
    }

    uint256 private _nextTokenId = 1;
    mapping(uint256 => WarrantyData) public warranties;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => bool) public minters;

    event WarrantyMinted(
        uint256 indexed tokenId,
        address indexed owner,
        bytes32 productHash,
        bytes32 orderRef,
        uint64 validUntil
    );

    error NotMinter();
    error UnknownToken();

    modifier onlyMinter() {
        if (!minters[msg.sender] && msg.sender != owner()) revert NotMinter();
        _;
    }

    constructor() ERC721("ChainCart Warranty", "CCW") Ownable(msg.sender) {
        minters[msg.sender] = true;
    }

    function setMinter(address minter, bool allowed) external onlyOwner {
        minters[minter] = allowed;
    }

    function mintWarranty(
        address to,
        bytes32 productHash,
        bytes32 orderRef,
        uint64 validUntil,
        string calldata uri
    ) external onlyMinter returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        warranties[tokenId] = WarrantyData({
            productHash: productHash,
            orderRef: orderRef,
            validUntil: validUntil
        });
        _tokenURIs[tokenId] = uri;
        emit WarrantyMinted(tokenId, to, productHash, orderRef, validUntil);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    function isValid(uint256 tokenId) external view returns (bool) {
        WarrantyData memory w = warranties[tokenId];
        if (w.validUntil == 0) return false;
        return block.timestamp <= w.validUntil;
    }
}
