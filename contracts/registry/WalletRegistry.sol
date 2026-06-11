// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../common/Ownable2StepUpgradeable.sol";

/**
 * @title WalletRegistry
 * @dev Extension contract managing a registry of wallet addresses.
 *
 * It maps wallets to user profiles including registration state, registration time,
 * KYC (Know Your Customer) levels, and custom metadata URIs (IPFS links, etc.).
 * It also supports registry admin roles for decentralized management of user accounts.
 */
abstract contract WalletRegistry is Ownable2StepUpgradeable {
    struct UserProfile {
        bool isRegistered;
        uint8 kycLevel;
        uint64 registrationTime;
        string metadataURI;
    }

    /// @dev Maps wallet address to their registered profile details
    mapping(address => UserProfile) private _profiles;

    /// @dev Maps addresses to their authorized admin status
    mapping(address => bool) private _registryAdmins;

    /**
     * @dev Emitted when a new wallet is registered.
     */
    event WalletRegistered(address indexed wallet, uint8 kycLevel, string metadataURI);

    /**
     * @dev Emitted when the KYC level of a wallet is updated.
     */
    event WalletKYCUpdated(address indexed wallet, uint8 oldKycLevel, uint8 newKycLevel);

    /**
     * @dev Emitted when the metadata URI of a wallet is updated.
     */
    event WalletMetadataUpdated(address indexed wallet, string oldMetadataURI, string newMetadataURI);

    /**
     * @dev Emitted when a wallet is removed from the registry.
     */
    event WalletDeregistered(address indexed wallet);

    /**
     * @dev Emitted when an admin's authorization status is changed.
     */
    event RegistryAdminStatusChanged(address indexed admin, bool status);

    /**
     * @dev Thrown when trying to register an address that is already registered.
     */
    error WalletAlreadyRegistered();

    /**
     * @dev Thrown when performing operations on an unregistered wallet.
     */
    error WalletNotRegistered();

    /**
     * @dev Thrown when input array lengths do not match in batch operations.
     */
    error ArrayLengthMismatch();

    /**
     * @dev Thrown when a caller is not an authorized registry admin.
     */
    error CallerNotRegistryAdmin();

    /**
     * @dev Thrown when a operation is requested on the zero address.
     */
    error ZeroAddress();

    /**
     * @dev Thrown when the target status is already set to the value provided.
     */
    error AdminStatusUnchanged();

    /**
     * @dev Modifier to restrict functions to authorized registry admins or the contract owner.
     */
    modifier onlyRegistryAdmin() {
        _checkRegistryAdmin();
        _;
    }

    /**
     * @dev Initializes the wallet registry context.
     */
    function __WalletRegistry_init() internal onlyInitializing {
        __WalletRegistry_init_unchained();
    }

    /**
     * @dev Unchained initialization function for the registry.
     */
    function __WalletRegistry_init_unchained() internal onlyInitializing {}

    /**
     * @dev Checks if the caller is the owner or an authorized registry admin.
     */
    function _checkRegistryAdmin() internal view virtual {
        if (owner() != msg.sender && !_registryAdmins[msg.sender]) {
            revert CallerNotRegistryAdmin();
        }
    }

    /**
     * @dev Checks if a wallet is registered in the system.
     * @param wallet The address to check.
     */
    function isWalletRegistered(address wallet) public view virtual returns (bool) {
        return _profiles[wallet].isRegistered;
    }

    /**
     * @dev Returns the registered profile details of a wallet.
     * @param wallet The address of the registered wallet.
     * @return isRegistered True if the wallet is registered.
     * @return kycLevel The KYC tier/level assigned to the wallet.
     * @return registrationTime The Unix timestamp when the wallet was registered.
     * @return metadataURI The metadata reference link containing additional off-chain details.
     */
    function getWalletProfile(address wallet)
        public
        view
        virtual
        returns (
            bool isRegistered,
            uint8 kycLevel,
            uint64 registrationTime,
            string memory metadataURI
        )
    {
        UserProfile memory profile = _profiles[wallet];
        return (profile.isRegistered, profile.kycLevel, profile.registrationTime, profile.metadataURI);
    }

    /**
     * @dev Returns whether an address is an authorized registry admin.
     * @param admin The address to query.
     */
    function isRegistryAdmin(address admin) public view virtual returns (bool) {
        return _registryAdmins[admin];
    }

    /**
     * @dev Sets or revokes registry admin status for an address.
     * Can only be called by the contract owner.
     * @param admin The target address.
     * @param status True to authorize, false to revoke.
     */
    function setRegistryAdmin(address admin, bool status) external virtual onlyOwner {
        if (admin == address(0)) {
            revert ZeroAddress();
        }
        if (_registryAdmins[admin] == status) {
            revert AdminStatusUnchanged();
        }
        _registryAdmins[admin] = status;
        emit RegistryAdminStatusChanged(admin, status);
    }

    /**
     * @dev Registers a wallet into the registry.
     * Can be called by the owner or any authorized registry admin.
     * @param wallet The address of the user wallet.
     * @param kycLevel The initial KYC level to assign.
     * @param metadataURI Reference string containing profile info.
     */
    function registerWallet(
        address wallet,
        uint8 kycLevel,
        string calldata metadataURI
    ) public virtual onlyRegistryAdmin {
        if (wallet == address(0)) {
            revert ZeroAddress();
        }
        if (_profiles[wallet].isRegistered) {
            revert WalletAlreadyRegistered();
        }

        _profiles[wallet] = UserProfile({
            isRegistered: true,
            kycLevel: kycLevel,
            registrationTime: uint64(block.timestamp),
            metadataURI: metadataURI
        });

        emit WalletRegistered(wallet, kycLevel, metadataURI);
    }

    /**
     * @dev Registers multiple wallets in a single transaction to save gas.
     * Can be called by the owner or any authorized registry admin.
     * @param wallets Array of wallet addresses.
     * @param kycLevels Array of KYC levels matching each wallet.
     * @param metadataURIs Array of metadata URIs matching each wallet.
     */
    function batchRegisterWallets(
        address[] calldata wallets,
        uint8[] calldata kycLevels,
        string[] calldata metadataURIs
    ) external virtual onlyRegistryAdmin {
        uint256 length = wallets.length;
        if (length != kycLevels.length || length != metadataURIs.length) {
            revert ArrayLengthMismatch();
        }

        for (uint256 i = 0; i < length; i++) {
            registerWallet(wallets[i], kycLevels[i], metadataURIs[i]);
        }
    }

    /**
     * @dev Updates the KYC level of an existing registered wallet.
     * Can be called by the owner or any authorized registry admin.
     * @param wallet The address of the registered wallet.
     * @param newKycLevel The new KYC level to set.
     */
    function updateWalletKYC(address wallet, uint8 newKycLevel) external virtual onlyRegistryAdmin {
        if (!_profiles[wallet].isRegistered) {
            revert WalletNotRegistered();
        }
        uint8 oldKycLevel = _profiles[wallet].kycLevel;
        _profiles[wallet].kycLevel = newKycLevel;
        emit WalletKYCUpdated(wallet, oldKycLevel, newKycLevel);
    }

    /**
     * @dev Updates the metadata URI of an existing registered wallet.
     * Can be called by the owner or any authorized registry admin.
     * @param wallet The address of the registered wallet.
     * @param newMetadataURI The new metadata string.
     */
    function updateWalletMetadata(address wallet, string calldata newMetadataURI) external virtual onlyRegistryAdmin {
        if (!_profiles[wallet].isRegistered) {
            revert WalletNotRegistered();
        }
        string memory oldMetadataURI = _profiles[wallet].metadataURI;
        _profiles[wallet].metadataURI = newMetadataURI;
        emit WalletMetadataUpdated(wallet, oldMetadataURI, newMetadataURI);
    }

    /**
     * @dev Removes a wallet from the registry.
     * Can be called by the owner or any authorized registry admin.
     * @param wallet The address to remove.
     */
    function deregisterWallet(address wallet) external virtual onlyRegistryAdmin {
        if (!_profiles[wallet].isRegistered) {
            revert WalletNotRegistered();
        }
        delete _profiles[wallet];
        emit WalletDeregistered(wallet);
    }

    /**
     * @dev Storage gap to allow future upgrades without shifting child storage layouts.
     */
    uint256[50] private __gap;
}
