// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

struct ProjectDynamicContent {
    /**
     * How many tokens remained for sale.
     */
    uint256 remainTokenCount;
    /**
     * How many tokens have already been purchased.
     */
    uint256 totalPurchasedAmount;
    /**
     * How many addresses have been made the purchase.
     * Refund addressed are excluded.
     */
    uint256 buyerCount;
    /**
     * If the threshold milestone has been finished by creator/owner.
     */
    bool thresholdMilestonePassed;
    /**
     * If the last milestone has been finished by creator/owner.
     */
    bool lastMilestoneFinished;
    /**
     * Indicate when the last milestone is update. Used to calculate the cool-down time.
     */
    uint256 lastUpdateTime;
    /**
     * Counter for current finished milestone. Updated when finishing a milestone.
     */
    uint8 finishedMilestoneCount;
    /**
     * Index of the next to-be-done milestone.
     */
    uint8 nextMilestoneIndex;
    /**
     * Status of this project.<br>
     * 0 - PENDING, the initialized status, only payStake and cancel is allowed.<br>
     * 1 - ONGOING, from PENDING, after pay the stake, ready to operate.<br>
     * 2 - FINISHED, from ONGOING, after creator finish this project.<br>
     */
    uint8 status;
}
