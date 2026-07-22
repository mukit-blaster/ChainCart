// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ChainCart Product Registry
/// @notice Stores keccak256 product fingerprints so authenticity can be
///         publicly verified without revealing the underlying product data.
///         Anyone can verify; only registered sellers can register.
contract ProductRegistry {
    struct Product {
        address seller;
        uint64 registeredAt;
        bool exists;
    }

    address public owner;
    mapping(bytes32 => Product) private _products;
    mapping(address => bool) public isSeller;

    event SellerRegistered(address indexed seller);
    event SellerRemoved(address indexed seller);
    event ProductRegistered(bytes32 indexed hash, address indexed seller);
    event ProductRevoked(bytes32 indexed hash);

    error NotOwner();
    error NotSeller();
    error AlreadyRegistered();
    error UnknownProduct();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlySeller() {
        if (!isSeller[msg.sender]) revert NotSeller();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerSeller(address seller) external onlyOwner {
        isSeller[seller] = true;
        emit SellerRegistered(seller);
    }

    function removeSeller(address seller) external onlyOwner {
        isSeller[seller] = false;
        emit SellerRemoved(seller);
    }

    /// @notice Pin a product fingerprint on-chain. The off-chain backend
    ///         computes the hash over canonical product fields.
    function registerProduct(bytes32 hash) external onlySeller {
        if (_products[hash].exists) revert AlreadyRegistered();
        _products[hash] = Product({
            seller: msg.sender,
            registeredAt: uint64(block.timestamp),
            exists: true
        });
        emit ProductRegistered(hash, msg.sender);
    }

    function revokeProduct(bytes32 hash) external {
        Product memory p = _products[hash];
        if (!p.exists) revert UnknownProduct();
        // Owner or original seller can revoke (e.g., counterfeit detected).
        if (msg.sender != owner && msg.sender != p.seller) revert NotSeller();
        delete _products[hash];
        emit ProductRevoked(hash);
    }

    function verify(bytes32 hash)
        external
        view
        returns (bool registered, address seller, uint64 registeredAt)
    {
        Product memory p = _products[hash];
        return (p.exists, p.seller, p.registeredAt);
    }
}
