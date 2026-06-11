// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./Initializable.sol";

/**
 * @title UUPSUpgradeable
 * @dev Base contract for UUPS (Universal Upgradeable Proxy Standard) implementation.
 *
 * Upgrade authorization is handled by overriding the internal `_authorizeUpgrade` function.
 * Since the upgrade functions reside in the implementation contract, they must check
 * that they are called through a proxy (`onlyProxy` modifier) to prevent upgrading
 * the implementation contract itself directly.
 */
abstract contract UUPSUpgradeable is Initializable {
    /**
     * @dev ERC-1967 Implementation slot: keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1.
     * Calculated as: `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`.
     */
    bytes32 private constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /**
     * @dev Emitted when the implementation is upgraded.
     * @param implementation The address of the new implementation contract.
     */
    event Upgraded(address indexed implementation);

    /**
     * @dev Thrown when trying to upgrade to an address that does not contain code.
     */
    error ImplementationNotContract();

    /**
     * @dev Thrown when a delegatecall initialization step in the upgrade fails.
     */
    error UpgradeFailed();

    /**
     * @dev Thrown when upgrade functions are executed directly on the implementation contract.
     */
    error ActiveProxyRequired();

    /// @dev Immutable variable to store the address of the implementation contract itself during deployment.
    address private immutable __self = address(this);

    /**
     * @dev Modifier to guarantee that the function is only called through a proxy delegatecall.
     */
    modifier onlyProxy() {
        if (address(this) == __self) {
            revert ActiveProxyRequired();
        }
        _;
    }

    /**
     * @dev Upgrades the contract to a new implementation.
     * Can only be called via a proxy.
     * @param newImplementation The address of the new implementation contract.
     */
    function upgradeTo(address newImplementation) public virtual onlyProxy {
        _authorizeUpgrade(newImplementation);
        _upgradeToAndCall(newImplementation, new bytes(0), false);
    }

    /**
     * @dev Upgrades the contract to a new implementation and runs an initialization step.
     * Can only be called via a proxy.
     * @param newImplementation The address of the new implementation contract.
     * @param data The initialization data to be executed on the new implementation via delegatecall.
     */
    function upgradeToAndCall(address newImplementation, bytes memory data) public payable virtual onlyProxy {
        _authorizeUpgrade(newImplementation);
        _upgradeToAndCall(newImplementation, data, true);
    }

    /**
     * @dev Internal function to authorize the upgrade. Must be overridden by the main contract
     * to enforce access control (e.g. restrict to the contract owner).
     * @param newImplementation The address of the proposed new implementation contract.
     */
    function _authorizeUpgrade(address newImplementation) internal virtual;

    /**
     * @dev Returns the address of the active implementation contract stored in the ERC-1967 slot.
     */
    function _getImplementation() internal view returns (address impl) {
        bytes32 slot = _IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    /**
     * @dev Modifies the implementation address in the ERC-1967 slot and executes optional initialization data.
     * @param newImplementation The address of the new implementation.
     * @param data Optional delegatecall initialization payload.
     * @param forceCall Boolean indicating whether to force the delegatecall even if data length is zero.
     */
    function _upgradeToAndCall(
        address newImplementation,
        bytes memory data,
        bool forceCall
    ) internal {
        // Ensure new implementation address is a contract
        if (newImplementation.code.length == 0) {
            revert ImplementationNotContract();
        }

        // Write the implementation address to the ERC-1967 slot
        bytes32 slot = _IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, newImplementation)
        }

        emit Upgraded(newImplementation);

        // Execute delegatecall initialization if specified
        if (data.length > 0 || forceCall) {
            (bool success, ) = newImplementation.delegatecall(data);
            if (!success) {
                revert UpgradeFailed();
            }
        }
    }

    /**
     * @dev Storage gap to allow future upgrades without shifting child storage layouts.
     */
    uint256[50] private __gap;
}
