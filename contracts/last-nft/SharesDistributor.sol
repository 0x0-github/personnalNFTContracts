// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "solady/src/auth/Ownable.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface IBlurPool {
    function withdraw(uint256 amount) external;
}

contract SharesDistributor is Ownable {
    error ZeroBalance();
    error TransferFailed();

    struct Part {
        address wallet;
        uint16 salesPart;
        uint16 royaltiesPart;
    }

    address private blurPool = 0x0000000000A39bb272e79075ade125fd351887Ac;

    Part[] public parts;
    mapping(address => bool) public callers;

    constructor() payable {
        _initializeOwner(msg.sender);

        // TODO
        parts.push(Part(0xecB4278af1379c38Eab140063fFC426f05FEde28, 15, 15));
        callers[0xecB4278af1379c38Eab140063fFC426f05FEde28] = true;
        //
        parts.push(Part(address(0x0), 20, 20));
        //
        parts.push(Part(address(0x1), 20, 20));
        //
        parts.push(Part(address(0x2), 15, 15));
        //
        parts.push(Part(address(0x3), 30, 30));
    }

    function setCaller(address addr, bool allow) external {
        _checkOwner();

        callers[addr] = allow;
    }

    function setRoyaltiesPart(uint256 index, uint256 shares) external {
        _checkOwner();

        parts[index].royaltiesPart = uint16(shares);
    }

    function setBlurPool(address addr) external {
        _checkOwner();

        blurPool = addr;
    }

    function shareETHSalesPart() external {
        _checkCaller();

        uint256 balance = address(this).balance;

        if (balance == 0) revert ZeroBalance();

        for (uint256 i; i < parts.length;++i) {
            Part memory part = parts[i];

            unchecked {
                if (part.salesPart > 0) {
                    _withdraw(
                        part.wallet,
                        balance * part.salesPart / 100
                    );
                }
            }
        }
    }

    function shareETHRoyaltiesPart() external {
        _checkCaller();

        uint256 balance = address(this).balance;

        if (balance == 0) _efficientRevert(ZeroBalance.selector);

        for (uint256 i; i < parts.length;++i) {
            Part memory part = parts[i];

            unchecked {
                if (part.royaltiesPart > 0) {
                    _withdraw(
                        part.wallet,
                        balance * part.royaltiesPart / 100
                    );
                }
            }
        }
    }

    function shareTokenRoyaltiesPart(address token) external {
        _checkCaller();

        IERC20 tokenContract = IERC20(token);

        uint256 balance = tokenContract.balanceOf(address(this));

        if (balance == 0) _efficientRevert(ZeroBalance.selector);

        for (uint256 i; i < parts.length;++i) {
            Part memory part = parts[i];

            if (part.royaltiesPart > 0) {
                unchecked {
                    if (!tokenContract.transfer(
                        part.wallet,
                        balance * part.royaltiesPart / 100
                    )) _efficientRevert(TransferFailed.selector);
                }
            }
        }
    }

    function withdrawFromBlurPool() external {
        address pool = blurPool;

        IBlurPool(pool).withdraw(IERC20(pool).balanceOf(address(this)));
    }

    function _withdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{value: _amount}("");

        if (!success) _efficientRevert(TransferFailed.selector);
    }

    function _checkCaller() private view {
        if (!callers[msg.sender]) _efficientRevert(Unauthorized.selector);
    }

    function _efficientRevert(bytes4 errSel) internal pure {
        assembly {
            mstore(0x0, errSel)
            revert(0x0, 0x4)
        }
    }

    receive() external payable {}

}
