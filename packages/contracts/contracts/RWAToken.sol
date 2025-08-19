// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RWAToken
 * @dev Real World Asset (RWA) Token for Setaradapps
 * Supports multiple asset types: gold, property, commodity
 */
contract RWAToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    struct Asset {
        string assetType;    // "gold", "property", "commodity"
        uint256 value;       // Real-world value in USD (8 decimals)
        string metadata;     // IPFS hash for asset details
        bool verified;
        uint256 timestamp;
    }
    
    struct UserAsset {
        uint256 assetId;
        uint256 amount;
        uint256 purchasePrice;
        uint256 purchaseDate;
    }
    
    // Asset management
    mapping(uint256 => Asset) public assets;
    mapping(address => UserAsset[]) public userAssets;
    mapping(address => uint256) public userAssetCount;
    
    // Asset counters
    uint256 public totalAssets;
    uint256 public totalAssetValue;
    
    // Events
    event AssetCreated(uint256 indexed assetId, string assetType, uint256 value, string metadata);
    event AssetVerified(uint256 indexed assetId, bool verified);
    event AssetPurchased(address indexed user, uint256 indexed assetId, uint256 amount, uint256 price);
    event AssetSold(address indexed user, uint256 indexed assetId, uint256 amount, uint256 price);
    
    // Modifiers
    modifier onlyVerifiedAsset(uint256 assetId) {
        require(assets[assetId].verified, "Asset not verified");
        _;
    }
    
    modifier validAssetId(uint256 assetId) {
        require(assetId > 0 && assetId <= totalAssets, "Invalid asset ID");
        _;
    }
    
    constructor() ERC20("Setaradapps RWA Token", "SRWA") {
        totalAssets = 0;
        totalAssetValue = 0;
    }
    
    /**
     * @dev Create a new asset (only owner)
     */
    function createAsset(
        string memory assetType,
        uint256 value,
        string memory metadata
    ) external onlyOwner {
        totalAssets++;
        assets[totalAssets] = Asset({
            assetType: assetType,
            value: value,
            metadata: metadata,
            verified: false,
            timestamp: block.timestamp
        });
        
        emit AssetCreated(totalAssets, assetType, value, metadata);
    }
    
    /**
     * @dev Verify an asset (only owner)
     */
    function verifyAsset(uint256 assetId) external onlyOwner validAssetId(assetId) {
        assets[assetId].verified = true;
        emit AssetVerified(assetId, true);
    }
    
    /**
     * @dev Purchase asset tokens
     */
    function purchaseAsset(
        uint256 assetId,
        uint256 amount
    ) external payable onlyVerifiedAsset(assetId) nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= amount * assets[assetId].value / 1e8, "Insufficient payment");
        
        // Add to user assets
        userAssets[msg.sender].push(UserAsset({
            assetId: assetId,
            amount: amount,
            purchasePrice: assets[assetId].value,
            purchaseDate: block.timestamp
        }));
        
        userAssetCount[msg.sender]++;
        
        // Mint tokens
        _mint(msg.sender, amount);
        
        emit AssetPurchased(msg.sender, assetId, amount, assets[assetId].value);
    }
    
    /**
     * @dev Sell asset tokens
     */
    function sellAsset(
        uint256 assetId,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Find and update user asset
        bool found = false;
        for (uint256 i = 0; i < userAssets[msg.sender].length; i++) {
            if (userAssets[msg.sender][i].assetId == assetId) {
                require(userAssets[msg.sender][i].amount >= amount, "Insufficient asset amount");
                userAssets[msg.sender][i].amount -= amount;
                found = true;
                break;
            }
        }
        
        require(found, "Asset not found in user portfolio");
        
        // Burn tokens
        _burn(msg.sender, amount);
        
        // Calculate payout
        uint256 payout = amount * assets[assetId].value / 1e8;
        
        // Transfer payment
        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Transfer failed");
        
        emit AssetSold(msg.sender, assetId, amount, assets[assetId].value);
    }
    
    /**
     * @dev Get user's asset portfolio
     */
    function getUserAssets(address user) external view returns (UserAsset[] memory) {
        return userAssets[user];
    }
    
    /**
     * @dev Get asset details
     */
    function getAsset(uint256 assetId) external view validAssetId(assetId) returns (Asset memory) {
        return assets[assetId];
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Override transfer function to check pause
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
