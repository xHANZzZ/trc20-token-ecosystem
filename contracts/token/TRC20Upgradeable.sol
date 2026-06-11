// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../interfaces/ITRC20.sol";
import "../common/Initializable.sol";

/**
 * @title TRC20Upgradeable
 * @dev Implementation of the ITRC20 interface.
 *
 * This contract is designed to be upgradeable and uses Solidity 0.8.20 custom errors
 * instead of revert strings to maximize gas efficiency. It includes a storage gap
 * to permit adding storage variables in future implementations without collisions.
 */
abstract contract TRC20Upgradeable is Initializable, ITRC20 {
    /// @dev User balance mapping
    mapping(address => uint256) private _balances;

    /// @dev Spender allowance mapping: owner => spender => amount
    mapping(address => mapping(address => uint256)) private _allowances;

    /// @dev Total circulating supply of tokens
    uint256 private _totalSupply;

    /// @dev Token name
    string private _name;

    /// @dev Token symbol
    string private _symbol;

    /**
     * @dev Thrown when sender has insufficient balance for a transfer.
     */
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

    /**
     * @dev Thrown when spender has insufficient allowance for a transfer.
     */
    error ERC20InsufficientAllowance(address spender, uint256 currentAllowance, uint256 needed);

    /**
     * @dev Thrown when transferring from the zero address.
     */
    error ERC20InvalidSender(address sender);

    /**
     * @dev Thrown when transferring to the zero address.
     */
    error ERC20InvalidReceiver(address receiver);

    /**
     * @dev Thrown when attempting to approve from the zero address.
     */
    error ERC20InvalidApprover(address approver);

    /**
     * @dev Thrown when attempting to approve to the zero address.
     */
    error ERC20InvalidSpender(address spender);

    /**
     * @dev Initializes the token contract with a name and a symbol.
     */
    function __TRC20_init(string memory name_, string memory symbol_) internal onlyInitializing {
        __TRC20_init_unchained(name_, symbol_);
    }

    /**
     * @dev Unchained initialization function. Sets the token name and symbol.
     */
    function __TRC20_init_unchained(string memory name_, string memory symbol_) internal onlyInitializing {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals, default is 18.
     */
    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    /**
     * @dev Returns the total supply.
     */
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the balance of `account`.
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Moves tokens to a recipient.
     * @param recipient The address receiving tokens.
     * @param amount The quantity to transfer.
     */
    function transfer(address recipient, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        _transfer(owner, recipient, amount);
        return true;
    }

    /**
     * @dev Returns the remaining allowance of a spender.
     */
    function allowance(address owner, address spender) public view virtual returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev Grants spending rights to a spender.
     * @param spender The address authorized to spend tokens.
     * @param amount The allowance limit.
     */
    function approve(address spender, uint256 amount) public virtual returns (bool) {
        address owner = msg.sender;
        _approve(owner, spender, amount);
        return true;
    }

    /**
     * @dev Moves tokens from a sender using allowance.
     * @param sender The address from which tokens are sent.
     * @param recipient The address receiving tokens.
     * @param amount The quantity to transfer.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual returns (bool) {
        address spender = msg.sender;
        _spendAllowance(sender, spender, amount);
        _transfer(sender, recipient, amount);
        return true;
    }

    /**
     * @dev Internal transfer function. Enforces zero address checks and updates balances.
     * Emits a {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        if (from == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        if (fromBalance < amount) {
            revert ERC20InsufficientBalance(from, fromBalance, amount);
        }
        unchecked {
            _balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum of two integers is <= max uint256.
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    /**
     * @dev Internal minting function. Increases totalSupply.
     * Emits a {Transfer} event with the from address set to zero.
     */
    function _mint(address account, uint256 amount) internal virtual {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        unchecked {
            // Overflow not possible: balance cannot exceed totalSupply which is capped.
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Internal burn function. Decreases totalSupply.
     * Emits a {Transfer} event with the to address set to zero.
     */
    function _burn(address account, uint256 amount) internal virtual {
        if (account == address(0)) {
            revert ERC20InvalidSender(address(0));
        }

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        if (accountBalance < amount) {
            revert ERC20InsufficientBalance(account, accountBalance, amount);
        }
        unchecked {
            _balances[account] = accountBalance - amount;
            // Overflow not possible: totalSupply >= accountBalance >= amount.
            _totalSupply -= amount;
        }

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    /**
     * @dev Internal approve function. Sets allowance for a spender.
     * Emits an {Approval} event.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        if (owner == address(0)) {
            revert ERC20InvalidApprover(address(0));
        }
        if (spender == address(0)) {
            revert ERC20InvalidSpender(address(0));
        }

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Spends part of a owner's allowance. Reverts if insufficient.
     */
    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < amount) {
                revert ERC20InsufficientAllowance(spender, currentAllowance, amount);
            }
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    /**
     * @dev Storage gap to allow future upgrades without shifting child storage layouts.
     */
    uint256[45] private __gap;
}
