// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract WithdrawFairly {
    error Unauthorized();
    error ZeroBalance();
    error TransferFailed();

    struct Part {
        address wallet;
        uint16 salesPart;
        uint16 royaltiesPart;
    }

    Part[] public parts;
    mapping(address => bool) public callers;

    event SharedETHPart(bool isSalePart);
    event SharedTokenPart(bool isSalePart);

    constructor(){
        parts.push(Part(0xecB4278af1379c38Eab140063fFC426f05FEde28, 1000, 1000));
        parts.push(Part(0xE1580cA711094CF2888716a54c5A892245653435, 2000, 2000));
        parts.push(Part(0x06DcBa9ef76B9C6a129Df78D55f99989905e5F96, 2800, 2800));
        parts.push(Part(0x9d246cA915ea31be43B4eF151e473d6e8Bc892eF, 2172, 2172));
        parts.push(Part(0x2af89f045fB0B17Ad218423Cff3744ee25a69845, 2028, 2028));
        callers[0xecB4278af1379c38Eab140063fFC426f05FEde28] = true;
    }

    modifier onlyCaller() {
        if (!callers[msg.sender]) revert Unauthorized();

        _;
    }

    function shareETHPart(bool isSalePart) external onlyCaller {
        uint256 balance = address(this).balance;
        
        if (balance == 0)
            revert ZeroBalance();

        uint256 maxLoop = parts.length;
        Part memory part;

        for (uint256 i; i < maxLoop;) {
            part = parts[i];

            if (!isSalePart && part.royaltiesPart > 0) {
                _withdraw(part.wallet, balance * part.royaltiesPart / 10000);
            } else if (isSalePart && part.salesPart > 0) {
                _withdraw(part.wallet, balance * part.salesPart / 10000);
            }

            unchecked {
                i++;
            }
        }

        emit SharedETHPart(isSalePart);
    }

     function shareTokenPart(
        bool isSalePart,
        address token
    )
        external
        onlyCaller
    {
        IERC20 tokenContract = IERC20(token);
        
        uint256 balance = tokenContract.balanceOf(address(this));
        
        if (balance == 0)
            revert ZeroBalance();

        uint256 maxLoop = parts.length;
        Part memory part;

        for (uint256 i; i < maxLoop;) {
            part = parts[i];

            if (!isSalePart && part.royaltiesPart > 0) {
                if (
                    !tokenContract.transfer(
                        part.wallet,
                        balance * part.royaltiesPart / 10000
                    )
                )
                    revert TransferFailed();
            } else if (isSalePart && part.salesPart > 0) {
                if (
                    !tokenContract.transfer(
                        part.wallet,
                        balance * part.royaltiesPart/ 10000
                    )
                )
                    revert TransferFailed();
            }

            unchecked {
                i++;
            }
        }

        emit SharedTokenPart(isSalePart);
    }

    function _withdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{value: _amount}("");
        
        if (!success)
            revert TransferFailed();
    }

    receive() external payable {}

}
