// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/extensions/ERC721ABurnable.sol";
import "./MerkleProofLib.sol";
import "./WithdrawFairly.sol";

// @author: 0x0

contract NFTContract is ERC721ABurnable, Ownable, WithdrawFairly {
    error NotPresaleTime();
    error NotSaleTime();
    error SaleNotStarted();
    error MintPaused();
    error AmountGreaterThanMax();
    error MaxPresaleMintsReached();
    error MaxSaleMintsReached();
    error NotWhitelisted();
    error IncorrectETHValue();
    error SoldOut();
    error CannotUpdateFrozenURI();

    uint256 public constant MINT_SUPPLY = 20;

    bool public mintPaused = false;
    bool public frozenURI = false;

    uint256 public salePrice = 2;
    uint256 public presalePrice = 1;

    uint256 public maxMintTx = 3;
    uint256 public maxMintPresale = 3;
    uint256 public maxMintSale = 100;

    uint256 public presaleStart;
    uint256 public presaleEnd;

    bytes32 public merkleRoot;

    string public baseURI;
    string public unrevealedURI;

    event MintPausedUpdated(bool paused);
    event SalePriceUpdated(uint256 price);
    event PresalePriceUpdated(uint256 price);
    event MaxMintTxUpdated(uint256 max);
    event MaxMintPresaleUpdated(uint256 max);
    event MaxMintSaleUpdated(uint256 max);
    event MerkleRootUpdated(bytes32 root);
    event UnrevealedURIUpdated(string unrevealedURI_);
    event Reveal(string baseURI_);
    event FrozenURI();

    constructor(uint256 presaleStart_, uint256 presaleEnd_, bytes32 merkleRoot_)
        ERC721A("NFTContract", "NFTC")
    {
        presaleStart = presaleStart_;
        presaleEnd = presaleEnd_;
        merkleRoot = merkleRoot_;
    }

    function setMintPaused(bool paused) external onlyOwner {
        mintPaused = paused;

        emit MintPausedUpdated(paused);
    }

    function setSalePrice(uint256 price) external onlyOwner {
        salePrice = price;

        emit SalePriceUpdated(price);
    }

    function setPresalePrice(uint256 price) external onlyOwner {
        presalePrice = price;

        emit PresalePriceUpdated(price);
    }

    function setMaxMintTx(uint256 max) external onlyOwner {
        maxMintTx = max;

        emit MaxMintTxUpdated(max);
    }

    function setMaxMintPresale(uint256 max) external onlyOwner {
        maxMintPresale = max;

        emit MaxMintPresaleUpdated(max);
    }

    function setMaxMintSale(uint256 max) external onlyOwner {
        maxMintSale = max;

        emit MaxMintSaleUpdated(max);
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
        if (frozenURI) revert CannotUpdateFrozenURI();

        baseURI = baseURI_;

        emit Reveal(baseURI_);
    }

    function freezeURI() external onlyOwner {
        frozenURI = true;

        emit FrozenURI();
    }

    function presaleMint(
        uint256 amount,
        address recipient,
        bytes32[] calldata _proof
    ) external payable {
        if (!isPresale()) revert NotPresaleTime();
        if (mintPaused) revert MintPaused();
        if (amount > maxMintTx) revert AmountGreaterThanMax();

        // Cannot overflow since amount will be limited by maxMintTx
        // total supply will be anytime lower than 2**256 - maxMintTx
        // and prices will be not matter what lower than 10^18
        unchecked {
            if (_totalMinted() + amount > MINT_SUPPLY) revert SoldOut();
            if (msg.value != amount * presalePrice) revert IncorrectETHValue();

            // No need to use aux yet as numberMinted == presale mints here
            if (_numberMinted(msg.sender) + amount > maxMintPresale)
                revert MaxPresaleMintsReached();
        }

        if (
            !MerkleProofLib.verify(
                _proof,
                merkleRoot,
                keccak256(abi.encodePacked(msg.sender))
            )
        )
            revert NotWhitelisted();

        _mint(recipient, amount);
    }

    function saleMint(uint256 amount, address recipient) external payable {
        if (!isSale()) revert NotSaleTime();
        if (mintPaused) revert MintPaused();
        if (amount > maxMintTx) revert AmountGreaterThanMax();

        uint64 currentSaleMints = _getAux(msg.sender);
        uint64 nextSaleMints;

        assembly {
            nextSaleMints := add(currentSaleMints, amount)
        }

        if (nextSaleMints > maxMintSale) revert MaxSaleMintsReached();

        // Cannot overflow since amount will be limited by maxMintTx
        // and total supply will be anytime lower than 2**256 - maxMintTx
        // and prices will be not matter what lower than 10^18
        unchecked {
            if (_totalMinted() + amount > MINT_SUPPLY) revert SoldOut();
            if (msg.value != amount * salePrice) revert IncorrectETHValue();
        }

        // Sets the sale mints
        _setAux(msg.sender, nextSaleMints);
        _mint(recipient, amount);
    }

    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    function numberMinted(address _owner) external view returns (uint256) {
        return _numberMinted(_owner);
    }

    function isPresale() public view returns (bool) {
        return block.timestamp > presaleStart &&
            block.timestamp < presaleEnd;
    }

    function isSale() public view returns (bool) {
        return block.timestamp > presaleEnd;
    }

    function tokenURI(uint256 _nftId)
        public
        view
        override(ERC721A, IERC721A)
        returns (string memory)
    {
        if (!_exists(_nftId)) revert URIQueryForNonexistentToken();

        if (bytes(baseURI).length != 0) {
            return
                string(abi.encodePacked(baseURI, _toString(_nftId), ".json"));
        }

        return unrevealedURI;
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}
