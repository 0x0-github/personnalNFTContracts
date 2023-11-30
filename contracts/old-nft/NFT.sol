// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "solady/src/utils/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "operator-filter-registry/src/DefaultOperatorFilterer.sol";
import "erc721a/contracts/ERC721A.sol";
// import "./WithdrawFairly.sol";

contract NFT is
    ERC721A,
    ERC2981,
    DefaultOperatorFilterer,
//    WithdrawFairly,
    Ownable
{
    using ECDSA for bytes32;

    error CannotUnfreezeURI();
    error CannotUpdateFrozenURI();
    error OnlyEOA();
    error CollectionSoldOut();
    error NotPresale();
    error MaxPresaleMints();
    error NotWhitelisted();
    error NotSale();
    error MintPaused();
    error MaxSaleTxMintsReached();
    error IncorrectETHValue();

    uint256 private constant _MAX_SUPPLY = 6000;

    uint256 private constant _BOOL_M = 1;
    uint256 private constant _U8_M = (1 << 8) - 1;
    uint256 private constant _U32_M = (1 << 32) - 1;
    uint256 private constant _U64_M = (1 << 64) - 1;

    uint256 private constant _PRESALE_END_O = 64;
    uint256 private constant _SALE_PRICE_O = 128;
    uint256 private constant _MAX_MINT_TX_O = 192;
    uint256 private constant _MAX_MINT_PRESALE_O = 200;
    uint256 private constant _MINT_PAUSED_O = 208;

    /** 
     * Bitmapping as follows:
     * [0..31]      presaleStart => enough till 2106
     * [32..63]     presaleEnd
     * [64..127]    presalePrice => max 18.44 ETH
     * [128..191]   salePrice
     * [192..199]   maxMintsPerTx => max 255
     * [200..207]   maxMintsPresale
     * [208..209]   mintPaused
     * [210..255]   leaving 46 bits
    */
    uint256 public conf;

    address public presaleAuthority;

    // Metadata data
    string public baseURI;
    bool public frozenURI;

    event SaleConfUpdated(uint256 newConf);
    event FrozenURI();
    event BaseURIUpdated(string baseURI);

    constructor(address _presaleAuthority) payable ERC721A("NFT", "N") {
        // Setting royalties to 5.5%
        _setDefaultRoyalty(address(this), 550);

        // Define base conf below
        conf = 1680138000 | (1680152400 << _PRESALE_END_O) | (0.055 ether << _SALE_PRICE_O,
            9,
            3,
            false
        );
        
    }

    function setDefaultRoyalty(
        address _receiver,
        uint96 _feeNumerator
    ) external onlyOwner {
        _setDefaultRoyalty(_receiver, _feeNumerator);
    }

    function setConfig(MeteoriaNFTConfig calldata newConf) external onlyOwner {
        config = newConf;

        emit MeteoriaNFTConfigUpdated(newConf);
    }

    function freezeURI() external onlyOwner {
        if (!frozenURI) {
            frozenURI = true;

            emit FrozenURI();
        }
    }

    function setBaseURI(string calldata baseURI_) external onlyOwner {
        if (frozenURI) revert CannotUpdateFrozenURI();

        baseURI = baseURI_;

        emit BaseURIUpdated(baseURI_);
    }

    function ownerMint(uint256 amount, address to) external onlyOwner {
        if (isSoldOut(amount)) revert CollectionSoldOut();

        _mint(to, amount);
    }

    function ownershipOf(
        uint256 tokenId
    ) external view returns (TokenOwnership memory) {
        return _ownershipOf(tokenId);
    }

    function isSoldOut(uint256 nftWanted) public view returns (bool) {
        return _totalMinted() + nftWanted > _MAX_SUPPLY;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721A, ERC2981) returns (bool) {
        return ERC721A.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }

    function setApprovalForAll(
        address operator,
        bool approved
    ) public override onlyAllowedOperatorApproval(operator) {
        super.setApprovalForAll(operator, approved);
    }

    function approve(
        address operator,
        uint256 tokenId
    ) public payable override onlyAllowedOperatorApproval(operator) {
        super.approve(operator, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override onlyAllowedOperator(from) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public payable override onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function tokenURI(
        uint256 _nftId
    ) public view override returns (string memory) {
        if (!_exists(_nftId)) revert URIQueryForNonexistentToken();

        return string(abi.encodePacked(baseURI, _toString(_nftId), ".json"));
    }

    function burn(uint256 tokenId) public virtual {
        _burn(tokenId, true);
    }

    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    function numberMinted(address owner) external view returns (uint256) {
        return _numberMinted(owner);
    }

    function presaleMint(uint256 amount, bytes calldata signature)
        external
        payable
    {
        if (msg.sender != tx.origin) revert OnlyEOA();
        if (isSoldOut(amount)) revert CollectionSoldOut();
        if (
            _PRESALE_AUTHORITY != keccak256(
                abi.encodePacked(msg.sender)
            ).toEthSignedMessageHash().recover(signature)
        ) revert NotWhitelisted();

        MeteoriaNFTConfig memory conf = config;

        if (conf.mintPaused) revert MintPaused();
        if (
            block.timestamp < conf.presaleStart ||
            block.timestamp >= conf.presaleEnd
        ) revert NotPresale();

        uint256 meteoriumEarned;
        // Below cannot overflow as it would already have occured in isSoldOut
        // function which isn't using unchecked block, regarding the price,
        // this contract assume the price will not reach irrealistic price
        // for NFTs mints which would also require a huge collection size (
        // which would already cause trouble with ERC721A impl)
        unchecked {
            if (_numberMinted(msg.sender) + amount > conf.maxMintsPresale)
                revert MaxPresaleMints();

            if (msg.value != conf.salePrice * amount)
                revert IncorrectETHValue();

            meteoriumEarned = amount / _METEORIUM_MINT_RATE;
        }

        if (meteoriumEarned > 0) {
            _meteorium.mint(msg.sender, meteoriumEarned);
        }

        _mint(msg.sender, amount);
    }

    function saleMint(uint256 amount) external payable {
        if (msg.sender != tx.origin) revert OnlyEOA();
        if (isSoldOut(amount)) revert CollectionSoldOut();

        MeteoriaNFTConfig memory conf = config;

        if (conf.mintPaused) revert MintPaused();
        if (block.timestamp < conf.presaleEnd) revert NotSale();
        if (amount > conf.maxMintsPerTx) revert MaxSaleTxMintsReached();

        uint256 meteoriumEarned;

        unchecked {
            if (msg.value != conf.salePrice * amount)
                revert IncorrectETHValue();

            meteoriumEarned = amount / _METEORIUM_MINT_RATE;
        }

        if (meteoriumEarned > 0) {
            _meteorium.mint(msg.sender, meteoriumEarned);
        }

        _mint(msg.sender, amount);
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}
