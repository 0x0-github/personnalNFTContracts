// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721a/contracts/extensions/ERC721ABurnable.sol";
import "./MerkleProofLib.sol";

// @author: 0x0

contract NFTContract is ERC721ABurnable, Ownable {
    error TransferFailed();
    error SaleNotStarted();
    error MintPaused();
    error AmountGreaterThanMax();
    error IncorrectETHValue();
    error SoldOut();
    error CannotUpdateFrozenURI();

    uint256 public constant MINT_SUPPLY = 20;

    bool public mintPaused = false;
    bool public frozenURI = false;

    uint256 public salePrice = 2;
    uint256 public wlPrice = 1;

    uint256 public maxMintTx = 3;
    uint256 public maxMintWL = 3;

    uint256 public saleStart;

    bytes32 public merkleRoot;

    string public baseURI;
    string public unrevealedURI;

    event MintPausedUpdated(bool paused);
    event SalePriceUpdated(uint256 price);
    event WlPriceUpdated(uint256 price);
    event MaxMintTxUpdated(uint256 max);
    event MaxMintWLUpdated(uint256 max);
    event MerkleRootUpdated(bytes32 root);
    event UnrevealedURIUpdated(string unrevealedURI_);
    event Reveal(string baseURI_);
    event FrozenURI();

    constructor(uint256 saleStart_, bytes32 merkleRoot_)
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

    function setMaxMintTx(uint256 max) external onlyOwner {
        maxMintTx = max;

        emit MaxMintTxUpdated(max);
    }

    function setMaxMintWL(uint256 max) external onlyOwner {
        maxMintWL = max;

        emit MaxMintWLUpdated(max);
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

    function withdraw(address _address, uint256 _amount) external onlyOwner {
        (bool success, ) = _address.call{value: _amount}("");

        if (!success) revert TransferFailed();
    }

    function numberMinted(address _owner) external view returns (uint256) {
        return _numberMinted(_owner);
    }

    function saleMint(
        uint256 amount,
        address recipient,
        bytes32[] calldata _proof
    ) external payable {
        if (block.timestamp < saleStart) revert SaleNotStarted();
        if (mintPaused) revert MintPaused();
        if (amount > maxMintTx) revert AmountGreaterThanMax();

        // Cannot overflow since amount will be limited by maxMintTx
        // and total supply will be anytime lower than 2**256 - maxMintTx
        unchecked {
            if (_totalMinted() + amount > MINT_SUPPLY) revert SoldOut();
        }

        // TODO: Add check on max mints / max WL mints etc.. ?

        bool whitelisted = MerkleProofLib.verify(
            _proof,
            merkleRoot,
            keccak256(abi.encodePacked(msg.sender))
        );

        // Cannot overflow since amount will be limited by maxMintTx
        // and max supply check
        unchecked {
            if (whitelisted && msg.value != amount * wlPrice) {
                revert IncorrectETHValue();
            } else if (!whitelisted && msg.value != amount * salePrice) {
                revert IncorrectETHValue();
            }
        }

        _mint(recipient, amount);
    }

    function totalMinted() public view returns (uint256) {
        return _totalMinted();
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
