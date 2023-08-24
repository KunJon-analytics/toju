// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

library ExceptionMessages {
    error InvalidCaller();
    error FailedTransfer();
    error InvalidAmount();
    error RecordNotFound();
    error InvalidStageActive();
    error InvalidStatusAllowPending();
    error InvalidStatusAllowOngoing();
    error InvalidStatusAllowPendingAndOngoing();
    error InvalidStageAllowReadyToFinish();
    error InvalidStageReadyToFinish();
    error InsufficientAmountRemain(uint256 sent, uint256 remaining);
    error InCorrectAmount(uint256 sent, uint256 required);
    error InvalidSignature();
    error EmptyId();
    error InvalidTimestamp();
    error DuplicatedId();
    error InvalidMilestonesCount();
    error InvalidMilestonePassed();
    error InvalidMilestoneFinished();
    error InvalidMilestoneExpired();
    error ExpiredTimestamp();
    error NullDescription();
    error InvalidProofOfWork();
    error CoolDownTimeNotmet();
    error InvalidStakeRate();
    error InvalidMaxSellAmount();
    error InvalidThresholdIndex();
    error InvalidCoolDownInterval();
}
