// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

struct ProjectStaticContent {
    /**
     * The address of owner.
     */
    address owner;
    /**
     * The description of project.
     */
    string description;
    /**
     * Stake rate. Since EVM cannot process float number,
     * so we have to limit this to 0.00 (2 decimals)
     */
    uint8 stakeRate100;
    /**
     * Total sold token. Represented in fraction.
     */
    uint256 maxTokenSoldCount;
    /**
     * The count of milestones. The milestones are stored in separate keys,
     * instead of counting them on the fly, store the count will save gas.
     */
    uint8 milestoneCount;
    /**
     * The index of the threshold milestone.
     */
    uint8 thresholdIndex;
    /**
     * The millisecond representation of the cooldown interval.
     */
    uint256 coolDownInterval;
    /**
     * The timestamp indicate when this project is created.
     */
    uint256 creationTimestamp;
    /**
     * The expiry timestamp of the threshold milestone.
     * This field is duplicated, but will save gas if we don't
     * need to read that milestone for it's expire time, considering
     * we need this static content in almost every operation.
     */
    uint256 thresholdMilestoneExpireTime;
    /**
     * The expiry timestamp of the last milestone.
     * This field is duplicated, but will save gas if we don't
     * need to read that milestone for it's expire time, considering
     * we need this static content in almost every operation.
     */
    uint256 lastMilestoneExpireTime;
}

struct ProjectInput {
    string projectDescription;
    uint8 stakeRate100;
    uint256 maxTokenSoldCount;
    string[] milestoneTitles;
    string[] milestoneDescriptions;
    uint256[] endTimestamps;
    uint8 thresholdIndex;
    uint256 coolDownInterval;
}
