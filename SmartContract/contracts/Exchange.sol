// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract Exchange {
    struct Order {
        address trader;
        bool isBuyOrder; // True for buy, False for sell
        uint256 price; // Token price in ETH
        uint256 amount; // Amount of tokens
        bool isActive; // True if the order is still open
    }

    address public owner;
    IERC20 public token;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;
    Order[] public orders;

    event LiquidityAdded(address provider, uint256 tokenAmount, uint256 ethAmount);
    event LiquidityRemoved(address provider, uint256 tokenAmount, uint256 ethAmount);
    event Swap(address trader, uint256 inputAmount, uint256 outputAmount, bool isTokenToEth);
    event OrderPlaced(uint256 orderId, address trader, bool isBuyOrder, uint256 price, uint256 amount);
    event OrderFulfilled(uint256 orderId, address fulfiller, uint256 amount);
    event OrderCancelled(uint256 orderId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(IERC20 _token) {
        owner = msg.sender;
        token = _token;
    }

    // ===== AMM Functions =====

    function addLiquidity(uint256 tokenAmount) external payable {
        uint256 ethAmount = msg.value;
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Test Token transfer failed");

        liquidity[msg.sender] += ethAmount;
        totalLiquidity += ethAmount;

        emit LiquidityAdded(msg.sender, tokenAmount, ethAmount);
    }

    function removeLiquidity(uint256 amount) external {
        require(liquidity[msg.sender] >= amount, "Not enough liquidity");

        uint256 ethAmount = (address(this).balance * amount) / totalLiquidity;
        uint256 tokenAmount = (token.balanceOf(address(this)) * amount) / totalLiquidity;

        liquidity[msg.sender] -= amount;
        totalLiquidity -= amount;

        payable(msg.sender).transfer(ethAmount);
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");

        emit LiquidityRemoved(msg.sender, tokenAmount, ethAmount);
    }

    function ethToTokenSwap(uint256 minTokens) external payable {
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 tokensOut = getOutputAmount(msg.value, address(this).balance - msg.value, tokenReserve);

        require(tokensOut >= minTokens, "Insufficient output amount");
        require(token.transfer(msg.sender, tokensOut), "Token transfer failed");

        emit Swap(msg.sender, msg.value, tokensOut, false);
    }

    function tokenToEthSwap(uint256 tokenAmount, uint256 minEth) external {
        uint256 ethReserve = address(this).balance;
        uint256 ethOut = getOutputAmount(tokenAmount, token.balanceOf(address(this)), ethReserve);

        require(ethOut >= minEth, "Insufficient output amount");
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");

        payable(msg.sender).transfer(ethOut);

        emit Swap(msg.sender, tokenAmount, ethOut, true);
    }

    function getOutputAmount(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
        uint256 inputAmountWithFee = inputAmount * 997; // 0.3% fee
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
        //(inputAmount * 997 * outputReserve) / (inputReserve * 1000 + inputAmoun * 997)
        return numerator / denominator;
    }

    // ===== Orderbook Functions =====

    function placeOrder(bool isBuyOrder, uint256 price, uint256 amount) external payable {
        if (isBuyOrder) {
            require(msg.value >= price * amount, "Insufficient ETH sent");
        }

        orders.push(Order(msg.sender, isBuyOrder, price, amount, true));
        emit OrderPlaced(orders.length - 1, msg.sender, isBuyOrder, price, amount);
    }

    function fulfillOrder(uint256 orderId, uint256 amount) external {
        Order storage order = orders[orderId];
        require(order.isActive, "Order is not active");
        require(amount <= order.amount, "Amount exceeds order size");

        if (order.isBuyOrder) {
            require(msg.sender != order.trader, "Cannot fulfill your own order");
            uint256 ethAmount = amount * order.price;
            require(address(this).balance >= ethAmount, "Not enough ETH in contract");
            require(token.transferFrom(msg.sender, order.trader, amount), "Token transfer failed");
            payable(msg.sender).transfer(ethAmount);
        } else {
            require(msg.sender != order.trader, "Cannot fulfill your own order");
            uint256 ethAmount = amount * order.price;
            require(token.balanceOf(address(this)) >= amount, "Not enough tokens in contract");
            require(token.transfer(msg.sender, amount), "Token transfer failed");
            payable(order.trader).transfer(ethAmount);
        }

        order.amount -= amount;
        if (order.amount == 0) {
            order.isActive = false;
        }

        emit OrderFulfilled(orderId, msg.sender, amount);
    }

    function cancelOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.trader == msg.sender, "Only the order owner can cancel");
        require(order.isActive, "Order is not active");

        order.isActive = false;
        if (order.isBuyOrder) {
            uint256 refund = order.amount * order.price;
            payable(order.trader).transfer(refund);
        }

        emit OrderCancelled(orderId);
    }

    receive() external payable {}
}
