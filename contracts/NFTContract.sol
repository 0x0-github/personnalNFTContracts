// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/extensions/ERC721ABurnable.sol";

// @author: 0x0

contract NFTContract is ERC721ABurnable, Ownable {
    error TransferFailed();
    error SaleNotStarted();
    error MintPaused();
    error AmountGtMax();
    error IncorrectETHValue();
    error SoldOut();

    uint64 public constant MINT_SUPPLY = 20;

    bool public mintPaused = false;

    uint64 public maxMintTx = 3;

    uint256 public salePrice = 2;
    uint256 public wlPrice = 1;

    uint256 public saleStart;

    bytes32 public merkleRoot;

    string public baseURI;
    string public unrevealedURI;

    event MintPausedUpdated(bool paused);
    event SalePriceUpdated(uint256 price);
    event WlPriceUpdated(uint256 price);
    event MaxMintTxUpdated(uint64 max);
    event MerkleRootUpdated(bytes32 root);
    event UnrevealedURIUpdated(string unrevealedURI_);
    event Reveal(string baseURI_);

    constructor(
        uint256 saleStart_,
        bytes32 merkleRoot_
    )
        ERC721A("NFTContract", "NFTC")
    {
        saleStart = saleStart_;
        merkleRoot = merkleRoot_;
    }

    receive() external payable {}

    function setMintPaused(bool paused) external onlyOwner {
        mintPaused = paused;

        emit MintPausedUpdated(paused);
    }

    function setSalePrice(uint256 price) external onlyOwner {
        salePrice = price;

        emit SalePriceUpdated(price);
    }

    function setWlPrice(uint256 price) external onlyOwner {
        wlPrice = price;

        emit WlPriceUpdated(price);
    }

    function setMaxMintTx(uint64 max) external onlyOwner {
        maxMintTx = max;

        emit MaxMintTxUpdated(max);
    }

    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;

        emit MerkleRootUpdated(root);
    }

    function setUnrevealedURI(string calldata unrevealedURI_)
        external
        onlyOwner
    {
        unrevealedURI = unrevealedURI_;

        emit UnrevealedURIUpdated(unrevealedURI_);
    }

    function reveal(string calldata baseURI_) external onlyOwner {
        baseURI = baseURI_;

        emit Reveal(baseURI_);
    }

    function withdraw(address _address, uint256 _amount) external onlyOwner {
        (bool success, ) = _address.call{value: _amount}("");
        
        if (!success)
            revert TransferFailed();
    }

    function numberMinted(address _owner) external view returns (uint256) {
        return _numberMinted(_owner);
    }

    function saleMint(
        uint256 amount,
        address recipient,
        bytes32[] calldata _proof
    )
        external
        payable
    {
        if (block.timestamp < saleStart)
            revert SaleNotStarted();

        if (mintPaused)
            revert MintPaused();

        if (amount > maxMintTx)
            revert AmountGtMax();

        if (_totalMinted() + amount > MINT_SUPPLY)
            revert SoldOut();

        // TODO: Add check on max mints ?

        bool whitelisted = MerkleProof.verify(
            _proof,
            merkleRoot,
            keccak256(abi.encodePacked(msg.sender))
        );

        if (whitelisted && msg.value != amount * wlPrice) {
            revert IncorrectETHValue();
        } else if (!whitelisted && msg.value != amount * salePrice) {
            revert IncorrectETHValue();
        }

        _mint(recipient, amount);
    }

    function isSale() public view returns (bool) {
        return block.timestamp >= saleStart;
    }

    function totalMinted() public view returns (uint256) {
        return _totalMinted();
    }

    function tokenURI(uint256 _nftId)
        public
        view
        override
        returns (string memory)
    {
        if (!_exists(_nftId))
            revert URIQueryForNonexistentToken();

        if (bytes(baseURI).length != 0) {
            return string(
                abi.encodePacked(baseURI, _toString(_nftId), ".json")
            );
        }

        return unrevealedURI;
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}
