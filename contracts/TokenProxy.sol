// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title TokenProxy
 * @dev ERC-1967 upgradeable proxy contract.
 *
 * Delivers call delegation to a logic implementation address.
 * Standard implementation slot is at `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`.
 */
contract TokenProxy {
    /**
     * @dev ERC-1967 Storage slot: keccak-256 hash of "eip1967.proxy.implementation" subtracted by 1.
     * Calculated as: `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`.
     */
    bytes32 private constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /**
     * @dev Emitted when the proxy logic contract is updated.
     * @param implementation The address of the new logic contract.
     */
    event Upgraded(address indexed implementation);

    /**
     * @dev Thrown when trying to deploy the proxy pointing to a non-contract address.
     */
    error ImplementationNotContract();

    /**
     * @dev Thrown when the initialization call to the logic contract fails.
     */
    error DelegatecallFailed();

    /**
     * @dev Constructor setup. Deploys proxy, sets logic contract, and executes optional initializer.
     * @param _logic The address of the deployed logic contract.
     * @param _data Calldata to initialize the logic contract (can be empty).
     */
    constructor(address _logic, bytes memory _data) payable {
        if (_logic.code.length == 0) {
            revert ImplementationNotContract();
        }
        
        assembly {
            sstore(_IMPLEMENTATION_SLOT, _logic)
        }
        
        emit Upgraded(_logic);
        
        if (_data.length > 0) {
            (bool success, ) = _logic.delegatecall(_data);
            if (!success) {
                revert DelegatecallFailed();
            }
        }
    }

    /**
     * @dev Fallback function. Delegates incoming calls to the implementation.
     */
    fallback() external payable {
        _delegate(_implementation());
    }

    /**
     * @dev Receive function. Handles plain TRON/TRX transfers and delegates them.
     */
    receive() external payable {
        _delegate(_implementation());
    }

    /**
     * @dev Returns the implementation address.
     * @return impl The address of the active logic contract.
     */
    function implementation() external view returns (address impl) {
        return _implementation();
    }

    /**
     * @dev Returns the implementation address from the ERC-1967 storage slot.
     */
    function _implementation() internal view returns (address impl) {
        bytes32 slot = _IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    /**
     * @dev Delegates call to logic address.
     * Custom assembly reads calldata and forwards it via delegatecall, copying result.
     */
    function _delegate(address logic) internal {
        assembly {
            // Copy msg.data to memory
            calldatacopy(0, 0, calldatasize())

            // Forward the call to logic via delegatecall
            let result := delegatecall(gas(), logic, 0, calldatasize(), 0, 0)

            // Copy return values to memory
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
