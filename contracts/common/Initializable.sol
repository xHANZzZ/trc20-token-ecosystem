// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title Initializable
 * @dev Helper contract to support initializer functions in upgradeable contracts.
 * It provides modifiers `{initializer}` and `{reinitializer}` to restrict initializations.
 */
abstract contract Initializable {
    /// @dev Tracks the initialized version. Uses uint64 to save storage space.
    uint64 private _initialized;
    
    /// @dev Indicates if the contract is currently in the middle of initialization.
    bool private _initializing;

    /**
     * @dev Triggered when the contract has finished initialization.
     * @param version The version that was initialized.
     */
    event Initialized(uint64 version);

    /**
     * @dev Thrown when trying to initialize a contract that is already initialized or not currently initializing.
     */
    error InvalidInitialization();

    /**
     * @dev Thrown when trying to call an `onlyInitializing` function outside of an initializer.
     */
    error NotInitializing();

    /**
     * @dev Modifier to protect an initializer function from being invoked twice.
     */
    modifier initializer() {
        bool isTopLevelCall = !_initializing;
        
        // Check if we are in the initializer phase.
        // For logic contract deployment directly (code length 0 for constructor, code length > 0 for active deployments),
        // we permit initializing when _initialized is less than 1.
        if (
            !(isTopLevelCall && _initialized < 1) &&
            !(address(this).code.length == 0 && _initialized == 1)
        ) {
            revert InvalidInitialization();
        }
        
        _initialized = 1;
        if (isTopLevelCall) {
            _initializing = true;
        }
        _;
        if (isTopLevelCall) {
            _initializing = false;
            emit Initialized(1);
        }
    }

    /**
     * @dev Modifier to protect an upgrade/reinitializer function.
     * @param version The version number to upgrade to. Must be greater than the current version.
     */
    modifier reinitializer(uint64 version) {
        if (_initializing || _initialized >= version) {
            revert InvalidInitialization();
        }
        _initialized = version;
        _initializing = true;
        _;
        _initializing = false;
        emit Initialized(version);
    }

    /**
     * @dev Modifier to restrict functions to run only during contract initialization.
     */
    modifier onlyInitializing() {
        if (!_initializing) {
            revert NotInitializing();
        }
        _;
    }

    /**
     * @dev Locks the contract, preventing future reinitializations. This is typically invoked in the
     * implementation contract constructor to prevent direct initialization of the implementation.
     */
    function _disableInitializers() internal virtual {
        if (_initializing) {
            revert InvalidInitialization();
        }
        if (_initialized < type(uint64).max) {
            _initialized = type(uint64).max;
            emit Initialized(type(uint64).max);
        }
    }

    /**
     * @dev Returns the version that has been initialized.
     */
    function _getInitializedVersion() internal view returns (uint64) {
        return _initialized;
    }

    /**
     * @dev Returns true if the contract is currently initializing.
     */
    function _isInitializing() internal view returns (bool) {
        return _initializing;
    }
}
