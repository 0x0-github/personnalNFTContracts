// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "solady/src/utils/ECDSA.sol";
import "solady/src/tokens/ERC2981.sol";
import {DefaultOperatorFilterer} from "../blur-operator-filter/DefaultOperatorFilterer.sol";
import {ERC721A} from "erc721a/contracts/ERC721A.sol";
import {SharesDistributor} from "../SharesDistributor.sol";

contract NFTContractMock is
    ERC721A,
    ERC2981,
    DefaultOperatorFilterer,
    SharesDistributor
{
    using ECDSA for bytes32;

    error CannotUpdateFrozenURI();
    error CollectionSoldOut();
    error NotPresale();
    error MaxPresaleMints();
    error NotWhitelisted();
    error NotSale();
    error MintPaused();
    error MaxSaleTxMintsReached();
    error IncorrectETHValue();

    struct SaleConf {
        uint64 presaleStart;
        uint64 presaleEnd;
        uint64 salePrice;
        uint8 maxMintsPerTx;
        uint8 maxMintsPresale;
        bool mintPaused;
    }

    uint256 private constant _MAX_MINT_MASK = 0xffffffff;
    uint256 private constant _MAX_MINT_SIZE = 0x20;
    // TODO
    address private constant _PRESALE_AUTHORITY =
        0x8734A7EA99895869a16d2c2fc5DBAD78a40F1C70;
    uint256 private constant _MINT_SUPPLY = 100;

    SaleConf public conf;

    bool public frozenURI;

    // Metadata data
    string public hiddenURI;
    string public baseURI;

    event SaleConfUpdated(SaleConf newConf);
    event FrozenURI();
    event HiddenURIUpdated(string uri);
    event BaseURIUpdated(string uri);

    // TODO
    constructor() payable ERC721A("EternalSoul", "SOUL") {
        _setDefaultRoyalty(address(this), 550);

        conf = SaleConf(
            uint64(block.timestamp),
            uint64(block.timestamp + 10 minutes),
            uint64(block.timestamp + 10 minutes),
            1,
            2,
            3,
            3,
            5,
            7,
            false
        );
    }

    function setDefaultRoyalty(address _receiver, uint96 _feeNum) external {
        _checkOwner();

        _setDefaultRoyalty(_receiver, _feeNum);
    }

    function setConf(SaleConf calldata newConf) external {
        _checkOwner();

        conf = newConf;

        emit SaleConfUpdated(newConf);
    }

    function freezeURI() external {
        _checkOwner();

        if (!frozenURI) {
            frozenURI = true;

            emit FrozenURI();
        }
    }

    function setBaseURI(string calldata uri) external {
        _checkOwner();

        if (frozenURI) _revert(CannotUpdateFrozenURI.selector);

        baseURI = uri;

        emit BaseURIUpdated(uri);
    }

    function setHiddenURI(string calldata uri) external {
        _checkOwner();

        hiddenURI = uri;

        emit HiddenURIUpdated(uri);
    }

    function ownerMint(uint256 amount, address to) external {
        _checkOwner();

        if (isSoldOut(amount)) _revert(CollectionSoldOut.selector);

        _mint(to, amount);
    }

    function isSoldOut(uint256 nftWanted) public view returns (bool) {
        return _totalMinted() + nftWanted > _MINT_SUPPLY;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721A, ERC2981) returns (bool) {
        return ERC721A.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
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
        if (!_exists(_nftId)) _revert(URIQueryForNonexistentToken.selector);

        string memory uri = baseURI;

        return bytes(uri).length > 0 ?
            string(abi.encodePacked(uri, _toString(_nftId), ".json"))
            :
            hiddenURI;
    }

    function burn(uint256 tokenId) public virtual {
        _burn(tokenId, true);
    }

    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    function currentMints(
        address owner
    ) external view returns (uint256, uint256) {
        SaleConf memory cachedConf = conf;

        return _currentMints(cachedConf, owner);
    }

    function presaleMint(
        uint256 amount,
        bytes calldata signature
    ) external payable {
        if (isSoldOut(amount)) _revert(CollectionSoldOut.selector);

        SaleConf memory cConf = conf;

        if (cConf.mintPaused) _revert(MintPaused.selector);
        if (
            block.timestamp < cConf.presale1Start ||
            block.timestamp >= cConf.saleStart
        ) _revert(NotPresale.selector);

        bool isPhase1 = block.timestamp < cConf.presale2Start;

        // Phase 1 mints will be checked off signed data
        if (
            _PRESALE_AUTHORITY != keccak256(
                abi.encodePacked(msg.sender, isPhase1)
            ).toEthSignedMessageHash().recover(signature)
        ) _revert(NotWhitelisted.selector);

        (
            uint256 callerMints,
            uint256 maxPhase
        ) = _currentMints(cConf, msg.sender);

        // Below cannot overflow as it would already have occurred in isSoldOut
        // function which isn't using unchecked math
        unchecked {
            uint256 nextMints = callerMints + amount;

            if (nextMints > maxPhase) _revert(MaxPhaseMints.selector);

            uint256 expectedPrice;

            // Nothing to do if phase 1, mints will be based off _numberMinted
            if (!isPhase1) {
                _setAux(msg.sender, uint64(nextMints));

                expectedPrice = cConf.presale2Price;
            } else {
                expectedPrice = cConf.presale1Price;
            }

            if (msg.value != expectedPrice * amount)
                _revert(IncorrectETHValue.selector);
        }

        _mint(msg.sender, amount);
    }

    function saleMint(uint256 amount) external payable {
        if (isSoldOut(amount)) _revert(CollectionSoldOut.selector);

        SaleConf memory cConf = conf;

        if (cConf.mintPaused) _revert(MintPaused.selector);
        if (block.timestamp < cConf.saleStart) _revert(NotSale.selector);

        // Here to avoid extra sload, we repeat the whole logic here
        uint64 aux = _getAux(msg.sender);
        uint256 callerMints = aux >> _MAX_MINT_SIZE;

        // Same for unchecked as presaleMint
        unchecked {
            uint256 nextMints = callerMints + amount;

            if (nextMints > cConf.maxMintsSale)
                _revert(MaxPhaseMints.selector);

            _setAux(
                msg.sender,
                uint64((nextMints << _MAX_MINT_SIZE) | (aux & _MAX_MINT_MASK))
            );

            if (msg.value != cConf.salePrice * amount)
                _revert(IncorrectETHValue.selector);
        }

        _mint(msg.sender, amount);
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    function _currentMints(
        SaleConf memory cConf,
        address owner
    ) private view returns (uint256, uint256) {
        // Presale phase 1
        if (block.timestamp < cConf.presale2Start)
            return (_numberMinted(owner), cConf.maxMintsPresale1);

        // Presale phase 2
        if (block.timestamp < cConf.saleStart)
            return (
                _getAux(owner) & _MAX_MINT_MASK,
                cConf.maxMintsPresale2
            );

        // Else, sale phase
        return (
            _getAux(owner) >> _MAX_MINT_SIZE,
            cConf.maxMintsSale
        );
    }
}