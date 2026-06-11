// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./Initializable.sol";

/**
 * @title Ownable2StepUpgradeable
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an owner that can be granted exclusive access to specific functions.
 *
 * This version uses a two-step ownership transfer process where the pending owner must
 * explicitly accept ownership. This prevents transferring ownership to an incorrect
 * or inaccessible address.
 *
 * This contract is initializable and includes a storage gap to support future upgrades.
 */
abstract contract Ownable2StepUpgradeable is Initializable {
    /// @dev Owner storage slot
    address private _owner;
    
    /// @dev Pending owner storage slot
    address private _pendingOwner;

    /**
     * @dev Emitted when ownership is completed.
     * @param previousOwner The address of the old owner.
     * @param newOwner The address of the new owner.
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Emitted when ownership transfer is initiated.
     * @param previousOwner The address of the current owner.
     * @param newOwner The address of the proposed new owner.
     */
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Thrown when a non-owner calls an owner-restricted function.
     */
    error CallerNotOwner();

    /**
     * @dev Thrown when a non-pending owner calls ownership acceptance.
     */
    error CallerNotPendingOwner();

    /**
     * @dev Thrown when trying to transfer ownership to the zero address.
     */
    error NewOwnerCannotBeZeroAddress();

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    function __Ownable_init() internal onlyInitializing {
        __Ownable_init_unchained();
    }

    /**
     * @dev Unchained initialization function. Sets the transaction sender as the initial owner.
     */
    function __Ownable_init_unchained() internal onlyInitializing {
        _transferOwnership(msg.sender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Returns the address of the pending owner.
     */
    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != msg.sender) {
            revert CallerNotOwner();
        }
    }

    /**
     * @dev Starts the ownership transfer process. The proposed new owner must call `acceptOwnership` to finalize.
     * Can only be called by the current owner.
     * @param newOwner The proposed new owner address.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert NewOwnerCannotBeZeroAddress();
        }
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner(), newOwner);
    }

    /**
     * @dev Finalizes the ownership transfer. Must be called by the proposed new owner.
     */
    function acceptOwnership() public virtual {
        address sender = msg.sender;
        if (pendingOwner() != sender) {
            revert CallerNotPendingOwner();
        }
        _transferOwnership(sender);
    }

    /**
     * @dev Renounces the ownership of the contract. This means the contract will not have an owner,
     * disabling any owner-only functions.
     * Can only be called by the current owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Helper to execute the actual ownership transfer.
     * @param newOwner The address of the new owner.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        delete _pendingOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting storage slots.
     */
    uint256[49] private __gap;
}
