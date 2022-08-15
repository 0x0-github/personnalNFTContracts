// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MerkleProofLib.sol";

/**
 * @title Extra data contract for ERC721 tokens
 * @author 0x0
 * @notice Describes common behaviour for ERC721 like presale / sale,
 * WL, reveal, URI freezing...
 * @dev Packing variables to save space onchain but also to retreive faster
 * all the related data => 1 view tx. Save some space on ERC721 contract
 * and split logics => only IERC721 impl + custom impl (if so).
 */
abstract contract ERC721ExtraData is Ownable {
    /// @notice Once frozen the URI cannot be unfrozen
    error CannotUnfreezeURI();
    /// @notice Max supply cannot be increased once set (security)
    error CannotIncreaseMaxSupply();
    /// @notice Max supply cannot be set to 0 once set (security)
    error CannotClearMaxSupply();
    /// @notice Cannot mint if paused
    error MintPaused();
    /// @notice If URI is frozen cannot update it anymore
    error CannotUpdateFrozenURI();
    /// @notice Cannot mint presale if not presale time
    error NotPresaleTime();
    /// @notice Cannot mint more presale than max presale mints
    error MaxPresaleMintsReached();
    /// @notice Cannot mint presale if not whitelisted
    error NotWhitelisted();
    /// @notice Cannot mint sale if not sale time
    error NotSaleTime();
    /// @notice Cannot mint more sale than max sale mints
    error MaxSaleMintsReached();
    /// @notice Cannot mint more than max per transaction
    error AmountGreaterThanMax();
    /// @notice Cannot mint if incorrect ETH value sent
    error IncorrectETHValue();
    /// @notice Cannot mint if sold out.
    error SoldOut();

    /**
     * @notice Packs the data to query all through 1 view tx and easier reuse
     * offchain without bit manipulations.
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

    // Masking applied to retreive bool => 1 bit
    uint256 private constant _MASK_BOOL = 1;

    // Masking applied to retreive uint8
    uint256 private constant _MASK_UINT8 = (1 << 8) - 1;
    
    // Masking applied to retreive uint32
    uint256 private constant _MASK_UINT32 = (1 << 32) - 1;

    // Masking applied to retreive uint64
    uint256 private constant _MASK_UINT64 = (1 << 64) - 1;

    // Bit start position for frozen URI
    uint256 private constant _POS_FROZEN_URI = 1;

    // Bits start position for presale start
    uint256 private constant _POS_PRESALE_START = 2;

    // Bits start position for presale end
    uint256 private constant _POS_PRESALE_END = 34;

    // Bits start position for max supply
    uint256 private constant _POS_MAX_SUPPLY = 66;

    // Bits start position for presale price
    uint256 private constant _POS_PRESALE_PRICE = 98;

    // Bits start position for sale start
    uint256 private constant _POS_SALE_PRICE = 162;

    // Bits start position for max mint tx
    uint256 private constant _POS_MAX_MINT_TX = 226;

    // Bits start position for max mint presale
    uint256 private constant _POS_MAX_MINT_PRESALE = 234;

    // Bits start position for max mint sale
    uint256 private constant _POS_MAX_MINT_SALE = 242;
    
    /**
     * @notice Packing the configuration into a uint256
     * @dev packing mapped as below:
     * [0]           mintPaused
     * [1]           frozenURI         => cannot be unset once true
     * [2..33]       presaleStart      => enough till year 2106
     * [34..65]      presaleEnd        => as above
     * [66..97]      maxSupply         => max 4294967295 cannot be increased
     * [98..161]     presalePrice      => max 18.44... ETH
     * [162..225]    saleprice         => as above
     * [226..233]    maxMintTx         => max 255 / no infinity => overflow
     * [234..241]    maxMintPresale    => max 255
     * [242..249]    maxMintSale       => as above
     */
    uint256 private config;

    // Storing the merkle root for whitelist
    bytes32 public merkleRoot;

    /**
     * @notice Used for revelead ERC721
     * @dev The only one to set and use if no reveal feature
     */
    string public baseURI;

    /**
     * @notice Used for hidden ERC721
     * @dev Do not set or use if no reveal feature
     */
    string public unrevealURI;

    event ConfigUpdated(uint256 conf);
    event MerkleRootUpdated(bytes32 root);
    event UnrevealURIUpdated(string uri);
    event BaseURIUpdated(string uri);

    /**
     * @notice Updates the current conf packed as a uint256
     * @dev See extraDataToUint256 for conversions
     * @param next The packed config to set
     */
    function setConfig(uint256 next) external onlyOwner {
        uint256 previous = config;
        uint256 previousMaxSupply
            = (previous >> _POS_MAX_SUPPLY) & _MASK_UINT32;
        uint256 nextMaxSupply = (next >> _POS_MAX_SUPPLY) & _MASK_UINT32;

        // Prevents from setting max supply to 0
        if (nextMaxSupply == 0) revert CannotClearMaxSupply();

        // Prevents from increasing max supply
        if (
            previousMaxSupply != 0 &&
            previousMaxSupply < nextMaxSupply
        ) {
            revert CannotIncreaseMaxSupply();
        }

        // Prevents from unsetting frozenURI
        if (
            (previous >> _POS_FROZEN_URI) & _MASK_BOOL == 1 &&
            (next >> _POS_FROZEN_URI) & _MASK_BOOL == 0
        ) {
            revert CannotUnfreezeURI();
        }

        config = next;
 
        emit ConfigUpdated(next);
    }

    /**
     * @notice Updates the merkle root used for WL, see: merkle trees
     * @param root The new merkle root to set
     */
    function setMerkleRoot(bytes32 root) external onlyOwner {
        merkleRoot = root;

        emit MerkleRootUpdated(root);
    }

    /**
     * @notice Updates the unreveal URI
     * @dev Useless if no reveal feature
     * @param uri The URI to set
     */
    function setUnrevealURI(string calldata uri)
        external
        onlyOwner
    {
        unrevealURI = uri;

        emit UnrevealURIUpdated(uri);
    }

    /**
     * @notice Updates the base URI if frozenURI is false
     * @dev Only use this one if no reveal feature
     * @param uri The URI to set
     */
    function setBaseURI(string calldata uri) external onlyOwner {
        if ((config >> _POS_FROZEN_URI) & _MASK_BOOL == 1)
            revert CannotUpdateFrozenURI();

        baseURI = uri;

        emit BaseURIUpdated(uri);
    }

    /**
     * @notice Called to process presale mint
     * @dev Needs to process checks, mint and any storage update
     * on overriden function
     * @param amount The amount to mint
     * @param recipient The recipient of minted tokens
     * @param proof The merle proof for WL
     */
    function presaleMint(
        uint256 amount,
        address recipient,
        bytes32[] calldata proof
    ) virtual external payable;

    /**
     * @notice Called to process sale mint
     * @dev Needs to process checks, mint and any storage update
     * on overriden function
     * @param amount The amount to mint
     * @param recipient The recipient of minted tokens
     */
    function saleMint(
        uint256 amount,
        address recipient
    ) virtual external payable;

    /**
     * @notice From given structured extra data, packs everything into uint256
     * @dev Helper function to easily set the current config with wanted value 
     */
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

    /**
     * @notice Returns the current config as struct
     * @dev Improves config query using 1 tx instead of using multiple calls
     */
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

    /**
     * @notice Validates the presale mint call according to the current config
     * @dev Should be called on presale mint before _mint call, doesn't take
     * care of any write operation needed if using other impl than ERC721A
     * (relying on numberMinted is enough at this stage for this last one)
     * @param amount The amount to be minted
     * @param currentMinted The current ERC721 minted (pre-mint)
     * @param numberMinted The number already minted for presale by caller
     * @param proof The merkle proof for WL check based on caller
     */
    function _validatePresale(
        uint256 amount,
        uint256 currentMinted,
        uint256 numberMinted,
        bytes32[] calldata proof
    )
        internal
    {
        uint256 conf = config;

        if (conf & _MASK_BOOL == 1) revert MintPaused();

        if (
            block.timestamp < (conf >> _POS_PRESALE_START) & _MASK_UINT32 ||
            block.timestamp > (conf >> _POS_PRESALE_END) & _MASK_UINT32
        ) {
            revert NotPresaleTime();
        }
        
        if (amount > (conf >> _POS_MAX_MINT_TX) & _MASK_UINT8)
            revert AmountGreaterThanMax();

        // Both below cannot overflow since supply and amount are limited
        // - amount: 255
        // - max mintable (currentMinted + amount): 18446744073709551615
        // - max mintable presale per wallet (numberMinted + amount): 255
        unchecked {
            if (
                currentMinted + amount >
                    (conf >> _POS_MAX_SUPPLY) & _MASK_UINT32
            ) {
                revert SoldOut();
            }
                
            if (
                msg.value !=
                    amount * (conf >> _POS_PRESALE_PRICE) & _MASK_UINT64
            ) {
                revert IncorrectETHValue();
            }

            if (
                numberMinted + amount >
                    (conf >> _POS_MAX_MINT_PRESALE) & _MASK_UINT8
            ) {
               revert MaxPresaleMintsReached(); 
            }
        }

        if (
            !MerkleProofLib.verify(
                proof,
                merkleRoot,
                keccak256(abi.encodePacked(msg.sender))
            )
        ) {
            revert NotWhitelisted();
        }
    }

    /**
     * @notice Validates the sale mint call according to the current config
     * @dev Should be called on sale mint before _mint call, doesn't take
     * care of any write operation needed for caller sale minted amount
     * @param amount The amount to be minted
     * @param currentMinted The current ERC721 minted (pre-mint)
     * @param numberMinted The number already minted for sale by caller
     */
    function _validateSale(
        uint256 amount,
        uint256 currentMinted,
        uint256 numberMinted
    )
        internal
    {
        uint256 conf = config;

        if (conf & _MASK_BOOL == 1) revert MintPaused();
        if (block.timestamp < (conf >> _POS_PRESALE_END) & _MASK_UINT32)
            revert NotSaleTime();
        if (amount > (conf >> _POS_MAX_MINT_TX) & _MASK_UINT8)
            revert AmountGreaterThanMax();
        
        // Both below cannot overflow since supply and amount are limited
        // - amount: 255
        // - max mintable (currentMinted + amount): 18446744073709551615
        // - max mintable sale per wallet (numberMinted + amount): 255
        unchecked {
            if (
                currentMinted + amount >
                    (conf >> _POS_MAX_SUPPLY) & _MASK_UINT32
            ) {
                revert SoldOut();
            }

            if (
                msg.value !=
                    amount * (conf >> _POS_SALE_PRICE) & _MASK_UINT64
            ) {
                revert IncorrectETHValue();
            }

            if (
                numberMinted + amount >
                    (conf >> _POS_MAX_MINT_SALE) & _MASK_UINT8
            ) {
                revert MaxSaleMintsReached();
            }
        }
    }
}
