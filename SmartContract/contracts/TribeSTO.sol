// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TribeSTO is ERC20, Ownable {
    // Mapping für die Whitelist (KYC Compliance)
    mapping(address => bool) private _whitelisted;

    // Mapping für Dividenden-Salden
    mapping(address => uint256) private _dividendBalances;
    
    // Gesamtbetrag der ausgeschütteten Dividenden
    uint256 public totalDividends;

    // Events
    event AddressWhitelisted(address indexed account, bool status);
    event DividendsDeposited(uint256 amount);
    event DividendClaimed(address indexed account, uint256 amount);

    // Konstruktor
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * (10**decimals()));
    }

    // Whitelist-Funktion
    function whitelistAddress(address account, bool status) external onlyOwner {
        _whitelisted[account] = status;
        emit AddressWhitelisted(account, status);
    }

    modifier onlyWhitelisted(address account) {
        require(_whitelisted[account], "Address not whitelisted");
        _;
    }

    // Dividenden einzahlen (Ether-basiert)
    function depositDividends() external payable onlyOwner {
        require(msg.value > 0, "No Ether sent for dividends");
        totalDividends += msg.value;

        // Dividenden anteilig auf alle Tokenhalter verteilen
        uint256 totalSupply = totalSupply();
        require(totalSupply > 0, "No tokens minted");

        for (uint256 i = 0; i < totalSupply; i++) {
            address account = address(uint160(i)); // Hier Tokenhalter iterieren
            if (_whitelisted[account]) {
                uint256 balance = balanceOf(account);
                if (balance > 0) {
                    uint256 dividendShare = (msg.value * balance) / totalSupply;
                    _dividendBalances[account] += dividendShare;
                }
            }
        }

        emit DividendsDeposited(msg.value);
    }

    // Dividenden beanspruchen
    function claimDividends() external onlyWhitelisted(msg.sender) {
        uint256 amount = _dividendBalances[msg.sender];
        require(amount > 0, "No dividends to claim");

        // Saldo zurücksetzen und Ether auszahlen
        _dividendBalances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit DividendClaimed(msg.sender, amount);
    }

    // Überprüfen, ob eine Adresse Dividenden hat
    function dividendBalanceOf(address account) external view returns (uint256) {
        return _dividendBalances[account];
    }

    // Überschreibung der transfer-Funktion zur Whitelist-Validierung
    function transfer(address recipient, uint256 amount)
        public
        override
        onlyWhitelisted(msg.sender)
        onlyWhitelisted(recipient)
        returns (bool)
    {
        return super.transfer(recipient, amount);
    }

    // Überschreibung der transferFrom-Funktion zur Whitelist-Validierung
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override onlyWhitelisted(sender) onlyWhitelisted(recipient) returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }

    // Überprüfung der Whitelist
    function isWhitelisted(address account) public view returns (bool) {
        return _whitelisted[account];
    }
}


