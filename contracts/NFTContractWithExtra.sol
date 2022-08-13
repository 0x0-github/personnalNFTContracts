// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "erc721a/contracts/extensions/ERC721ABurnable.sol";
import "./ERC721ExtraData.sol";
import "./WithdrawFairly.sol";

// @author: 0x0

contract NFTContract is ERC721ABurnable, ERC721ExtraData, WithdrawFairly {
    constructor() ERC721A("NFTContract", "NFTC") {
    }

    function presaleMint(
        uint256 amount,
        address recipient,
        bytes32[] calldata proof
    ) override external payable {
        _validatePresale(
            amount,
            _totalMinted(),
            _numberMinted(msg.sender),
            proof
        );
        _mint(recipient, amount);
    }

    function saleMint(uint256 amount, address recipient)
        override
        external
        payable
    {
        uint64 currentSaleMints = _getAux(msg.sender);

        _validateSale(amount, _totalMinted(), currentSaleMints);
        // Sets the sale mints

        assembly {
            currentSaleMints := add(currentSaleMints, amount)
        }

        _setAux(msg.sender, currentSaleMints);
        _mint(recipient, amount);
    }

    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    function numberMinted(address _owner) external view returns (uint256) {
        return _numberMinted(_owner);
    }

    function tokenURI(uint256 _nftId)
        override(ERC721A, IERC721A)
        public
        view
        returns (string memory)
    {
        if (!_exists(_nftId)) revert URIQueryForNonexistentToken();

        if (bytes(baseURI).length != 0) {
            return
                string(abi.encodePacked(baseURI, _toString(_nftId), ".json"));
        }

        return unrevealURI;
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
}
