// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VestingContract
 * @dev Handles token vesting with cliff periods and linear release schedules
 */
contract VestingContract is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        bool revocable;
        bool revoked;
        IERC20 token;
    }

    mapping(bytes32 => VestingSchedule) public vestingSchedules;
    mapping(address => bytes32[]) public userVestingSchedules;
    mapping(address => uint256) public totalVestedAmount;

    uint256 public vestingScheduleCount;

    event VestingScheduleCreated(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration
    );

    event TokensClaimed(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount
    );

    event VestingScheduleRevoked(bytes32 indexed scheduleId);

    /**
     * @dev Constructor - sets the initial owner of the contract
     * @param initialOwner Address that will own the contract
     */
    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Create a new vesting schedule
     */
    function createVestingSchedule(
        address _beneficiary,
        uint256 _totalAmount,
        uint256 _startTime,
        uint256 _cliffDuration,
        uint256 _vestingDuration,
        bool _revocable,
        address _token
    ) external onlyOwner {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_totalAmount > 0, "Invalid amount");
        require(_vestingDuration > 0, "Invalid vesting duration");
        require(_startTime > 0, "Invalid start time");

        bytes32 scheduleId = keccak256(
            abi.encodePacked(_beneficiary, _totalAmount, _startTime, vestingScheduleCount++)
        );

        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        schedule.beneficiary = _beneficiary;
        schedule.totalAmount = _totalAmount;
        schedule.startTime = _startTime;
        schedule.cliffDuration = _cliffDuration;
        schedule.vestingDuration = _vestingDuration;
        schedule.revocable = _revocable;
        schedule.token = IERC20(_token);

        userVestingSchedules[_beneficiary].push(scheduleId);
        totalVestedAmount[_beneficiary] += _totalAmount;

        // Transfer tokens to this contract
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _totalAmount);

        emit VestingScheduleCreated(
            scheduleId,
            _beneficiary,
            _totalAmount,
            _startTime,
            _cliffDuration,
            _vestingDuration
        );
    }

    /**
     * @dev Claim vested tokens
     */
    function claimTokens(bytes32 scheduleId) external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.beneficiary == msg.sender, "Not authorized");
        require(!schedule.revoked, "Schedule revoked");

        uint256 claimableAmount = getClaimableAmount(scheduleId);
        require(claimableAmount > 0, "No tokens to claim");

        schedule.claimedAmount += claimableAmount;
        schedule.token.safeTransfer(msg.sender, claimableAmount);

        emit TokensClaimed(scheduleId, msg.sender, claimableAmount);
    }

    /**
     * @dev Get claimable amount for a vesting schedule
     */
    function getClaimableAmount(bytes32 scheduleId) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        
        if (schedule.revoked) {
            return 0;
        }

        uint256 currentTime = block.timestamp;
        uint256 cliffEnd = schedule.startTime + schedule.cliffDuration;
        
        // If cliff period hasn't ended, no tokens are claimable
        if (currentTime < cliffEnd) {
            return 0;
        }

        uint256 vestingEnd = schedule.startTime + schedule.vestingDuration;
        uint256 vestedAmount;

        if (currentTime >= vestingEnd) {
            // Fully vested
            vestedAmount = schedule.totalAmount;
        } else {
            // Partially vested - linear vesting after cliff
            uint256 vestingTime = currentTime - cliffEnd;
            uint256 totalVestingTime = vestingEnd - cliffEnd;
            vestedAmount = (schedule.totalAmount * vestingTime) / totalVestingTime;
        }

        return vestedAmount - schedule.claimedAmount;
    }

    /**
     * @dev Get next unlock time and amount
     */
    function getNextUnlock(bytes32 scheduleId) external view returns (uint256 unlockTime, uint256 unlockAmount) {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        
        if (schedule.revoked) {
            return (0, 0);
        }

        uint256 currentTime = block.timestamp;
        uint256 cliffEnd = schedule.startTime + schedule.cliffDuration;
        uint256 vestingEnd = schedule.startTime + schedule.vestingDuration;

        if (currentTime < cliffEnd) {
            // Next unlock is at cliff end
            unlockTime = cliffEnd;
            unlockAmount = (schedule.totalAmount * (cliffEnd - schedule.startTime)) / schedule.vestingDuration;
        } else if (currentTime < vestingEnd) {
            // Next unlock is in 1 day (or next vesting period)
            unlockTime = currentTime + 1 days;
            if (unlockTime > vestingEnd) {
                unlockTime = vestingEnd;
            }
            uint256 vestingTime = unlockTime - cliffEnd;
            uint256 totalVestingTime = vestingEnd - cliffEnd;
            uint256 vestedAmount = (schedule.totalAmount * vestingTime) / totalVestingTime;
            unlockAmount = vestedAmount - schedule.claimedAmount;
        } else {
            // Fully vested
            unlockTime = 0;
            unlockAmount = schedule.totalAmount - schedule.claimedAmount;
        }
    }

    /**
     * @dev Revoke a vesting schedule (if revocable)
     */
    function revokeVestingSchedule(bytes32 scheduleId) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.revocable, "Schedule not revocable");
        require(!schedule.revoked, "Already revoked");

        uint256 claimableAmount = getClaimableAmount(scheduleId);
        uint256 refundAmount = schedule.totalAmount - schedule.claimedAmount - claimableAmount;

        schedule.revoked = true;

        // Transfer claimable amount to beneficiary
        if (claimableAmount > 0) {
            schedule.token.safeTransfer(schedule.beneficiary, claimableAmount);
        }

        // Refund remaining amount to owner
        if (refundAmount > 0) {
            schedule.token.safeTransfer(owner(), refundAmount);
        }

        emit VestingScheduleRevoked(scheduleId);
    }

    /**
     * @dev Get user's vesting schedules
     */
    function getUserVestingSchedules(address user) external view returns (bytes32[] memory) {
        return userVestingSchedules[user];
    }

    /**
     * @dev Get vesting schedule details
     */
    function getVestingSchedule(bytes32 scheduleId) external view returns (
        address beneficiary,
        uint256 totalAmount,
        uint256 claimedAmount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable,
        bool revoked,
        address token
    ) {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        return (
            schedule.beneficiary,
            schedule.totalAmount,
            schedule.claimedAmount,
            schedule.startTime,
            schedule.cliffDuration,
            schedule.vestingDuration,
            schedule.revocable,
            schedule.revoked,
            address(schedule.token)
        );
    }
}