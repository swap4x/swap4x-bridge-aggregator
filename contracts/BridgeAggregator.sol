// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Swap4x Bridge Aggregator
 * @dev Multi-chain bridge aggregation with optimal route selection
 * @author Swap4x Team
 */
contract BridgeAggregator is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event BridgeInitiated(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 destinationChain,
        string bridgeProtocol,
        uint256 fee
    );
    
    event BridgeCompleted(
        address indexed user,
        bytes32 indexed bridgeId,
        uint256 amountReceived
    );
    
    event FeeCollected(address indexed token, uint256 amount);
    event BridgeProtocolAdded(string protocol, address adapter);
    event BridgeProtocolRemoved(string protocol);

    // Structs
    struct BridgeRoute {
        string protocol;        // Bridge protocol name
        address adapter;        // Bridge adapter contract
        uint256 fee;           // Fee in basis points (100 = 1%)
        uint256 estimatedTime; // Estimated completion time in seconds
        uint256 gasEstimate;   // Estimated gas cost
        bool isActive;         // Whether route is active
    }

    struct BridgeRequest {
        address user;
        address token;
        uint256 amount;
        uint256 destinationChain;
        string protocol;
        uint256 timestamp;
        bool completed;
    }

    // State variables
    mapping(string => BridgeRoute) public bridgeRoutes;
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(address => uint256) public collectedFees;
    
    string[] public supportedProtocols;
    uint256 public platformFee = 5; // 0.05% in basis points
    uint256 public constant MAX_FEE = 100; // 1% maximum fee
    
    address public feeCollector;
    bool public paused = false;

    // Modifiers
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier validProtocol(string memory protocol) {
        require(bridgeRoutes[protocol].isActive, "Protocol not supported");
        _;
    }

    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
    }

    /**
     * @dev Add a new bridge protocol
     */
    function addBridgeProtocol(
        string memory protocol,
        address adapter,
        uint256 fee,
        uint256 estimatedTime,
        uint256 gasEstimate
    ) external onlyOwner {
        require(adapter != address(0), "Invalid adapter address");
        require(fee <= MAX_FEE, "Fee too high");
        
        if (!bridgeRoutes[protocol].isActive) {
            supportedProtocols.push(protocol);
        }
        
        bridgeRoutes[protocol] = BridgeRoute({
            protocol: protocol,
            adapter: adapter,
            fee: fee,
            estimatedTime: estimatedTime,
            gasEstimate: gasEstimate,
            isActive: true
        });
        
        emit BridgeProtocolAdded(protocol, adapter);
    }

    /**
     * @dev Remove a bridge protocol
     */
    function removeBridgeProtocol(string memory protocol) external onlyOwner {
        require(bridgeRoutes[protocol].isActive, "Protocol not found");
        
        bridgeRoutes[protocol].isActive = false;
        
        // Remove from supported protocols array
        for (uint i = 0; i < supportedProtocols.length; i++) {
            if (keccak256(bytes(supportedProtocols[i])) == keccak256(bytes(protocol))) {
                supportedProtocols[i] = supportedProtocols[supportedProtocols.length - 1];
                supportedProtocols.pop();
                break;
            }
        }
        
        emit BridgeProtocolRemoved(protocol);
    }

    /**
     * @dev Get optimal bridge route for given parameters
     */
    function getOptimalRoute(
        address token,
        uint256 amount,
        uint256 destinationChain,
        string memory preference // "cheapest", "fastest", "balanced"
    ) external view returns (
        string memory bestProtocol,
        uint256 totalFee,
        uint256 estimatedTime,
        uint256 gasEstimate
    ) {
        require(supportedProtocols.length > 0, "No protocols available");
        
        uint256 bestScore = 0;
        string memory selectedProtocol;
        
        for (uint i = 0; i < supportedProtocols.length; i++) {
            string memory protocol = supportedProtocols[i];
            BridgeRoute memory route = bridgeRoutes[protocol];
            
            if (!route.isActive) continue;
            
            uint256 score = calculateRouteScore(route, preference);
            
            if (score > bestScore) {
                bestScore = score;
                selectedProtocol = protocol;
            }
        }
        
        require(bytes(selectedProtocol).length > 0, "No suitable route found");
        
        BridgeRoute memory optimalRoute = bridgeRoutes[selectedProtocol];
        uint256 protocolFee = (amount * optimalRoute.fee) / 10000;
        uint256 platformFeeAmount = (amount * platformFee) / 10000;
        
        return (
            selectedProtocol,
            protocolFee + platformFeeAmount,
            optimalRoute.estimatedTime,
            optimalRoute.gasEstimate
        );
    }

    /**
     * @dev Calculate route score based on preference
     */
    function calculateRouteScore(
        BridgeRoute memory route,
        string memory preference
    ) internal pure returns (uint256) {
        bytes32 prefHash = keccak256(bytes(preference));
        
        if (prefHash == keccak256(bytes("cheapest"))) {
            // Lower fee = higher score
            return 10000 - route.fee;
        } else if (prefHash == keccak256(bytes("fastest"))) {
            // Lower time = higher score
            return 86400 - route.estimatedTime; // 24 hours max
        } else {
            // Balanced: combine fee and time
            uint256 feeScore = (10000 - route.fee) / 2;
            uint256 timeScore = (86400 - route.estimatedTime) / 2;
            return feeScore + timeScore;
        }
    }

    /**
     * @dev Initiate bridge transaction
     */
    function initiateBridge(
        address token,
        uint256 amount,
        uint256 destinationChain,
        string memory protocol,
        bytes calldata bridgeData
    ) external payable nonReentrant whenNotPaused validProtocol(protocol) {
        require(amount > 0, "Amount must be greater than 0");
        require(token != address(0), "Invalid token address");
        
        // Calculate fees
        BridgeRoute memory route = bridgeRoutes[protocol];
        uint256 protocolFee = (amount * route.fee) / 10000;
        uint256 platformFeeAmount = (amount * platformFee) / 10000;
        uint256 totalFees = protocolFee + platformFeeAmount;
        uint256 bridgeAmount = amount - totalFees;
        
        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Collect platform fee
        collectedFees[token] += platformFeeAmount;
        
        // Generate bridge ID
        bytes32 bridgeId = keccak256(abi.encodePacked(
            msg.sender,
            token,
            amount,
            destinationChain,
            protocol,
            block.timestamp
        ));
        
        // Store bridge request
        bridgeRequests[bridgeId] = BridgeRequest({
            user: msg.sender,
            token: token,
            amount: amount,
            destinationChain: destinationChain,
            protocol: protocol,
            timestamp: block.timestamp,
            completed: false
        });
        
        // Approve tokens to bridge adapter
        IERC20(token).safeApprove(route.adapter, bridgeAmount);
        
        // Call bridge adapter
        (bool success,) = route.adapter.call(bridgeData);
        require(success, "Bridge execution failed");
        
        emit BridgeInitiated(
            msg.sender,
            token,
            amount,
            destinationChain,
            protocol,
            totalFees
        );
        
        emit FeeCollected(token, platformFeeAmount);
    }

    /**
     * @dev Mark bridge as completed (called by bridge adapters)
     */
    function completeBridge(
        bytes32 bridgeId,
        uint256 amountReceived
    ) external {
        BridgeRequest storage request = bridgeRequests[bridgeId];
        require(request.user != address(0), "Bridge request not found");
        require(!request.completed, "Bridge already completed");
        
        // Verify caller is the bridge adapter
        BridgeRoute memory route = bridgeRoutes[request.protocol];
        require(msg.sender == route.adapter, "Unauthorized caller");
        
        request.completed = true;
        
        emit BridgeCompleted(request.user, bridgeId, amountReceived);
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees(address token) external onlyOwner {
        uint256 amount = collectedFees[token];
        require(amount > 0, "No fees to withdraw");
        
        collectedFees[token] = 0;
        IERC20(token).safeTransfer(feeCollector, amount);
    }

    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        platformFee = newFee;
    }

    /**
     * @dev Update fee collector
     */
    function updateFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }

    /**
     * @dev Pause/unpause contract
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    /**
     * @dev Get all supported protocols
     */
    function getSupportedProtocols() external view returns (string[] memory) {
        return supportedProtocols;
    }

    /**
     * @dev Get bridge route details
     */
    function getBridgeRoute(string memory protocol) external view returns (BridgeRoute memory) {
        return bridgeRoutes[protocol];
    }

    /**
     * @dev Emergency withdrawal function
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}

