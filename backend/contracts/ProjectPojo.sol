// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ProjectMilestone} from "./ProjectMilestone.sol";

struct ProjectPojo {
    /**
     * The description of this project.
     */
    string description;
    /**
     * The owner's address.
     */
    address ownerAddress;
    /**
     * The timestamp indicate when this project is created.
     */
    uint256 creationTimestamp;
    /**
     * Stake rate represented in fraction (2 decimals).
     */
    uint8 stakeRate100;
    /**
     * Total sold tokens represented in fraction.
     */
    uint256 maxTokenSoldCount;
    /**
     * Total milestone count.
     */
    uint8 milestonesCount;
    /**
     * Array of milestones.
     */
    ProjectMilestone[] milestones;
    /**
     * The index of the threshold milestone.
     */
    uint8 thresholdMilestoneIndex;
    /**
     * Cooldown interval represented in milliseconds.
     */
    uint256 coolDownInterval;
    /**
     * The timestamp indicate when the project is updated.
     */
    uint256 lastUpdateTimestamp;
    /**
     * Index of the next to-be-done milestone.
     */
    uint8 nextMilestone;
    /**
     * How many tokens remained for sale.
     */
    uint256 remainTokenCount;
    /**
     * How many addresses have already made the purchase.
     * Refunded addresses are excluded.
     */
    uint256 buyerCount;
    /**
     * string representation of status.
     */
    string status;
    /**
     * string representation of stage, aka the sub status of a status.
     * For now only ONGOING has stages, rest of status has no stages, so
     * this will be null if the status != ONGOING.
     */
    string stage;
}
