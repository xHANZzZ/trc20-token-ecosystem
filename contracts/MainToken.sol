// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./token/TRC20Upgradeable.sol";
import "./registry/WalletRegistry.sol";
import "./common/UUPSUpgradeable.sol";

/**
 * @title MainToken
 * @dev Comprehensive UUPS Upgradeable TRC20 Token incorporating a Wallet Registry
 * and optional transfer compliance checking.
 *
 * This contract coordinates standard token operations with wallet profiling.
 * If compliance is enabled, transfers will revert if either the sender or receiver
 * is unregistered in the WalletRegistry (excluding mint and burn operations).
 */
contract MainToken is TRC20Upgradeable, WalletRegistry, UUPSUpgradeable {
    /// @dev Flag indicating whether transfer compliance checks are active
    bool private _complianceRequired;

    /**
     * @dev Emitted when the transfer compliance enforcement is toggled.
     */
    event ComplianceRequirementChanged(bool required);

    /**
     * @dev Thrown when an account fails compliance check (i.e. is not registered).
     */
    error ComplianceCheckFailed(address account);

    /**
     * @dev Constructor is used to lock initializers on the implementation contract
     * to protect it from being hijacked directly.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the main upgradeable token contract.
     * Maps to the proxy initialization call.
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param initialSupply The initial amount of tokens to mint to the deployer.
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    ) external initializer {
        __TRC20_init(name_, symbol_);
        __Ownable_init();
        __WalletRegistry_init();
        
        _complianceRequired = false;

        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply);
        }
    }

    /**
     * @dev Returns whether transfer compliance checking is active.
     */
    function complianceRequired() public view virtual returns (bool) {
        return _complianceRequired;
    }

    /**
     * @dev Toggles compliance checking.
     * Can only be called by the contract owner.
     * @param required True to enforce registry verification, false to disable.
     */
    function setComplianceRequired(bool required) external virtual onlyOwner {
        _complianceRequired = required;
        emit ComplianceRequirementChanged(required);
    }

    /**
     * @dev Creates new tokens.
     * Can only be called by the contract owner.
     * @param to The account receiving the minted tokens.
     * @param amount The number of tokens to mint.
     */
    function mint(address to, uint256 amount) external virtual onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Destroys tokens from the caller's balance.
     * @param amount The number of tokens to burn.
     */
    function burn(uint256 amount) external virtual {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Destroys tokens from a specified account, using the caller's allowance.
     * @param account The address to burn tokens from.
     * @param amount The number of tokens to burn.
     */
    function burnFrom(address account, uint256 amount) external virtual {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }

    /**
     * @dev Authorizes upgrade to a new implementation.
     * Restricts upgrades exclusively to the contract owner.
     * @param newImplementation The address of the proposed implementation contract.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Internal hook executing before any token transfer.
     * If compliance checking is enabled, verifies that both sender and recipient
     * are registered wallets. Exempts mint (sender is zero) and burn (recipient is zero) events.
     * @param from Address sending tokens.
     * @param to Address receiving tokens.
     * @param amount Quantity of tokens transferred.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(TRC20Upgradeable) {
        super._beforeTokenTransfer(from, to, amount);

        if (_complianceRequired) {
            if (from != address(0) && !isWalletRegistered(from)) {
                revert ComplianceCheckFailed(from);
            }
            if (to != address(0) && !isWalletRegistered(to)) {
                revert ComplianceCheckFailed(to);
            }
        }
    }
}
