// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MerkleProofLib.sol";

 /**
    Contract used to describe common behaviour for ERC721
    like presale / sale behaviours and URI freezing...
    packing variables to save space onchain but also
    to retreive faster all the related data => 1 view tx.
    Also save some space on ERC721 contract.
  */
contract ERC721ExtraData is Ownable {
    error CannotUnfreezeURI();
    error CannotIncreaseMaxSupply();
    error CannotClearMaxSupply();
    error MintPaused();
    error CannotUpdateFrozenURI();
    error NotPresaleTime();
    error MaxPresaleMintsReached();
    error NotWhitelisted();
    error NotSaleTime();
    error MaxSaleMintsReached();
    error AmountGreaterThanMax();
    error IncorrectETHValue();
    error SoldOut();

    /**
        Packs the data to query all through 1 view tx and reuse easier
        offchain without bit manipulations.
     */
    struct Data {
        bool mintPaused;
        bool frozenURI;
        uint32 presaleStart;
        uint32 presaleEnd;
        uint32 maxSupply;
        uint64 presalePrice;
        uint64 salePrice;
        uint8 maxMintTx;
        uint8 maxMintPresale;
        uint8 maxMintSale;
    }

    uint256 private constant _MASK_BOOL = 1;

    uint256 private constant _MASK_UINT8 = (1 << 8) - 1;
    
    uint256 private constant _MASK_UINT32 = (1 << 32) - 1;

    uint256 private constant _MASK_UINT64 = (1 << 64) - 1;

    uint256 private constant _POS_FROZEN_URI = 1;

    uint256 private constant _POS_PRESALE_START = 2;

    uint256 private constant _POS_PRESALE_END = 34;

    uint256 private constant _POS_MAX_SUPPLY = 66;

    uint256 private constant _POS_PRESALE_PRICE = 98;

    uint256 private constant _POS_SALE_PRICE = 162;

    uint256 private constant _POS_MAX_MINT_TX = 226;

    uint256 private constant _POS_MAX_MINT_PRESALE = 234;

    uint256 private constant _POS_MAX_MINT_SALE = 242;
    
    /**
        Packing all the configuration into a uint256
        mapped as below:
        [0]           mintPaused
        [1]           frozenURI         => cannot be unset once true
        [2..33]       presaleStart      => enough till year 2106
        [34..65]      presaleEnd        => as above
        [66..97]      maxSupply         => max 4294967295 cannot be increased
        [98..161]     presalePrice      => max 18.44... ETH
        [162..225]    saleprice         => as above
        [226..233]    maxMintTx         => max 255 / no infinity => overflow
        [234..241]    maxMintPresale    => as above / 0 = "infinite"
        [242..249]    maxMintSale       => as above
     */
     // MAKE PRIVATE
    uint256 private config;

    bytes32 public merkleRoot;

    string public baseURI;
    string public unrevealURI;

    event ConfigUpdated(uint256 conf);
    event MerkleRootUpdated(bytes32 root);
    event UnrevealURIUpdated(string unrevealedURI_);
    event BaseURIUpdated(string baseURI_);

    constructor(bytes32 root) {
        merkleRoot = root;
    }

    function setConfig(uint256 next) external onlyOwner {
        uint256 previous = config;
        uint256 previousMaxSupply = (previous >> _POS_MAX_SUPPLY) & _MASK_UINT32;
        uint256 nextMaxSupply = (next >> _POS_MAX_SUPPLY) & _MASK_UINT32;

        // Prevents from setting max supply to 0
        if (nextMaxSupply == 0) revert CannotClearMaxSupply();

        // Prevents from increasing max supply
        if (
            previousMaxSupply != 0 &&
            previousMaxSupply < nextMaxSupply
        ) revert CannotIncreaseMaxSupply();

        // Prevents from unsetting frozenURI
        if (
            (previous >> _POS_FROZEN_URI) & _MASK_BOOL == 1 &&
            (next >> _POS_FROZEN_URI) & _MASK_BOOL == 0
        ) revert CannotUnfreezeURI();

        config = next;
 
        emit ConfigUpdated(next);
    }

    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;

        emit MerkleRootUpdated(root);
    }

    function setUnrevealURI(string calldata uri)
        external
        onlyOwner
    {
        unrevealURI = uri;

        emit UnrevealURIUpdated(uri);
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        if ((config >> _POS_FROZEN_URI) & _MASK_BOOL == 1)
            revert CannotUpdateFrozenURI();

        baseURI = uri;

        emit BaseURIUpdated(uri);
    }

    function extraDataToUint256(Data calldata)
        external
        pure
        returns (uint256 packedData)
    {
        assembly {
            packedData := add(
                add(
                    add(
                        add(
                            add(
                                add(
                                    add(
                                        add(
                                            add(
                                                calldataload(0x4), 
                                                shl(
                                                    _POS_FROZEN_URI,
                                                    calldataload(0x24)
                                                )
                                            ),
                                            shl(
                                                _POS_PRESALE_START,
                                                calldataload(0x44)
                                            )
                                        ),
                                        shl(
                                            _POS_PRESALE_END,
                                            calldataload(0x64)
                                        )
                                    ),
                                    shl(
                                        _POS_MAX_SUPPLY,
                                        calldataload(0x84)
                                    )
                                ),
                                shl(
                                    _POS_PRESALE_PRICE,
                                    calldataload(0xA4)
                                )
                            ),
                            shl(
                                _POS_SALE_PRICE,
                                calldataload(0xC4)
                            )
                        ),
                        shl(
                            _POS_MAX_MINT_TX,
                            calldataload(0xE4)
                        )
                    ),
                    shl(
                        _POS_MAX_MINT_PRESALE,
                        calldataload(0x104)
                    )
                ),
                shl(
                    _POS_MAX_MINT_SALE,
                    calldataload(0x124)
                )
            )
        }
    }

    function getExtraData() external view returns (Data memory) {
        return Data(
            config & _MASK_BOOL == 1,
            (config >> _POS_FROZEN_URI) & _MASK_BOOL == 1,
            uint32((config >> _POS_PRESALE_START) & _MASK_UINT32),
            uint32((config >> _POS_PRESALE_END) & _MASK_UINT32),
            uint32((config >> _POS_MAX_SUPPLY) & _MASK_UINT32),
            uint64((config >> _POS_PRESALE_PRICE) & _MASK_UINT64),
            uint64((config >> _POS_SALE_PRICE) & _MASK_UINT64),
            uint8((config >> _POS_MAX_MINT_TX) & _MASK_UINT8),
            uint8((config >> _POS_MAX_MINT_PRESALE) & _MASK_UINT8),
            uint8((config >> _POS_MAX_MINT_SALE) & _MASK_UINT8)
        );
    }

    function _validatePresale(
        uint256 amount,
        uint256 currentSupply,
        uint256 numberMinted,
        bytes32[] calldata _proof
    )
        internal
    {
        uint256 conf = config;

        if (conf & _MASK_BOOL == 1) revert MintPaused();
        if (
            block.timestamp < (conf >> _POS_PRESALE_START) & _MASK_UINT32 ||
            block.timestamp > (conf >> _POS_PRESALE_END) & _MASK_UINT32
        ) revert NotPresaleTime();
        if (amount > (conf >> _POS_MAX_MINT_TX) & _MASK_UINT8)
            revert AmountGreaterThanMax();

        unchecked {
            if (currentSupply + amount > (conf >> _POS_MAX_SUPPLY) & _MASK_UINT32)
                revert SoldOut();
            if (msg.value != amount * (conf >> _POS_PRESALE_PRICE) & _MASK_UINT64)
                revert IncorrectETHValue();
            if (numberMinted + amount > (conf >> _POS_MAX_MINT_PRESALE) & _MASK_UINT8)
                revert MaxPresaleMintsReached();
        }

        if (
            !MerkleProofLib.verify(
                _proof,
                merkleRoot,
                keccak256(abi.encodePacked(msg.sender))
            )
        ) revert NotWhitelisted();
    }

    function _validateSale(
        uint256 amount,
        uint256 currentSupply,
        uint256 numberMintedSale
    )
        internal
    {
        uint256 conf = config;

        if (config & _MASK_BOOL == 1) revert MintPaused();
        if (block.timestamp < (config >> _POS_PRESALE_END) & _MASK_UINT32)
            revert NotSaleTime();
        if (amount > (conf >> _POS_MAX_MINT_TX) & _MASK_UINT8)
            revert AmountGreaterThanMax();
        
        unchecked {
            if (currentSupply + amount > (conf >> _POS_MAX_SUPPLY) & _MASK_UINT32)
                revert SoldOut();
            if (msg.value != amount * (conf >> _POS_SALE_PRICE) & _MASK_UINT64)
                revert IncorrectETHValue();
            if (numberMintedSale + amount > (conf >> _POS_MAX_MINT_SALE) & _MASK_UINT8)
                revert MaxSaleMintsReached();
        }
    }
}
