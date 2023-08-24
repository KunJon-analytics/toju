// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ProjectDynamicContent} from "./ProjectDynamicContent.sol";
import {ProjectStaticContent} from "./ProjectStaticContent.sol";
import {ProjectMilestone} from "./ProjectMilestone.sol";
import {ProjectPojo} from "./ProjectPojo.sol";

/// @title library for Toju
library TojuLibrary {
    /// @notice creates a new project dynamic content
    /// @param _remainTokenCount The liquidity before change
    /// @return newContent a new project dynamic content
    function createDynamicContent(
        uint256 _remainTokenCount
    ) internal pure returns (ProjectDynamicContent memory newContent) {
        newContent = ProjectDynamicContent({
            remainTokenCount: _remainTokenCount,
            totalPurchasedAmount: 0,
            buyerCount: 0,
            thresholdMilestonePassed: false,
            lastMilestoneFinished: false,
            lastUpdateTime: 0,
            finishedMilestoneCount: 0,
            nextMilestoneIndex: 0,
            status: 0
        });

        return newContent;
    }

    /// @notice Calculate the partial refund amount.
    /// @param dynamicContent of a given project
    /// @param staticContent of a given project
    /// @param buyerPurchaseAmount of a given project
    /// @return toBuyerAmount The amount remaining after refund
    /// @return toCreatorAmount The amount refunded to the creator
    function partialRefund(
        ProjectDynamicContent memory dynamicContent,
        ProjectStaticContent memory staticContent,
        uint256 buyerPurchaseAmount
    ) internal pure returns (uint256 toBuyerAmount, uint256 toCreatorAmount) {
        uint256 totalMilestones = staticContent.milestoneCount;
        // finished milestone belongs to creator
        toCreatorAmount =
            (buyerPurchaseAmount * dynamicContent.finishedMilestoneCount) /
            totalMilestones;
        // rest of them goes back to buyer
        toBuyerAmount = buyerPurchaseAmount - toCreatorAmount;
        // add to remain token
        dynamicContent.remainTokenCount += buyerPurchaseAmount;
        // remove from total sold amount
        dynamicContent.totalPurchasedAmount -= buyerPurchaseAmount;
        dynamicContent.buyerCount--;
        return (toBuyerAmount, toCreatorAmount);
    }

    /// @notice Calculate the full refund amount.
    /// @param dynamicContent of a given project
    /// @param amount of the purchase record
    /// @return refundAmount the amount of refund
    function fullRefund(
        ProjectDynamicContent memory dynamicContent,
        uint256 amount
    ) internal pure returns (uint256 refundAmount) {
        // add to remain token
        dynamicContent.remainTokenCount += amount;
        // remove from total sold amount
        dynamicContent.totalPurchasedAmount -= amount;
        dynamicContent.buyerCount--;
        return amount;
    }

    /// @notice creates a new project static content.
    /// @param owner of the project
    /// @param description of the project
    /// @param stakeRate100 of the project
    /// @param maxTokenSoldCount of the project
    /// @param milestoneCount of the project
    /// @param thresholdIndex of the project
    /// @param coolDownInterval of the project
    /// @param thresholdMilestoneExpireTime of the project
    /// @param lastMilestoneExpireTime of the project
    /// @param creationTimestamp of the project
    /// @return newContent the new static content of the project
    function createStaticContent(
        address owner,
        string calldata description,
        uint8 stakeRate100,
        uint256 maxTokenSoldCount,
        uint8 milestoneCount,
        uint8 thresholdIndex,
        uint256 coolDownInterval,
        uint256 thresholdMilestoneExpireTime,
        uint256 lastMilestoneExpireTime,
        uint256 creationTimestamp
    ) internal pure returns (ProjectStaticContent memory newContent) {
        newContent = ProjectStaticContent({
            owner: owner,
            description: description,
            stakeRate100: stakeRate100,
            maxTokenSoldCount: maxTokenSoldCount,
            milestoneCount: milestoneCount,
            thresholdIndex: thresholdIndex,
            coolDownInterval: coolDownInterval,
            thresholdMilestoneExpireTime: thresholdMilestoneExpireTime,
            lastMilestoneExpireTime: lastMilestoneExpireTime,
            creationTimestamp: creationTimestamp
        });
    }

    /// @notice Get total staked token count.
    /// @param staticContent of a given project.
    /// @return token count in fraction. 1.00 token means 100.
    function getTotalStake(
        ProjectStaticContent memory staticContent
    ) internal pure returns (uint256 token) {
        token =
            (staticContent.stakeRate100 * staticContent.maxTokenSoldCount) /
            100;
    }

    /// @notice Gets if the threshold milestone is expired.
    /// @param staticContent of a given project.
    /// @return true if the threshold milestone is expired, according to the expiry time.
    function isThresholdExpired(
        ProjectStaticContent memory staticContent,
        uint256 blockTimestamp
    ) internal pure returns (bool) {
        return staticContent.thresholdMilestoneExpireTime <= blockTimestamp;
    }

    /// @notice Gets if the last milestone is expired.
    /// @param staticContent of a given project.
    /// @return true if the last milestone is expired, according to the expiry time.
    function isLastExpired(
        ProjectStaticContent memory staticContent,
        uint256 blockTimestamp
    ) internal pure returns (bool) {
        return staticContent.lastMilestoneExpireTime <= blockTimestamp;
    }

    /**
     * @param staticContent  ProjectStaticContent of the given project.
     * @param dynamicContent ProjectDynamicContent of the given project.
     * @return true if the project is ready to finish. (last milestone is finished or expired)
     */
    function checkIfReadyToFinish(
        ProjectStaticContent memory staticContent,
        ProjectDynamicContent memory dynamicContent,
        uint256 blockTimestamp
    ) internal pure returns (bool) {
        if (dynamicContent.status != 1) {
            return false;
        }
        return
            dynamicContent.lastMilestoneFinished ||
            isLastExpired(staticContent, blockTimestamp);
    }

    /**
     * @param staticContent  ProjectStaticContent of the given project.
     * @param dynamicContent ProjectDynamicContent of the given project.
     * @return true if the threshold milestone is finished or expired.
     */
    function checkIfThresholdMet(
        ProjectStaticContent memory staticContent,
        ProjectDynamicContent memory dynamicContent,
        uint256 blockTimestamp
    ) internal pure returns (bool) {
        if (dynamicContent.status != 1) {
            return false;
        }
        return
            dynamicContent.thresholdMilestonePassed ||
            isThresholdExpired(staticContent, blockTimestamp);
    }

    /// @notice Creates Pojo.
    /// @param staticContent of a given project.
    /// @param dynamicContent of a given project.
    /// @param milestones of a given project.
    /// @return newPojo of a project.
    function createPojo(
        ProjectStaticContent memory staticContent,
        ProjectDynamicContent memory dynamicContent,
        ProjectMilestone[] memory milestones,
        uint256 blockTimestamp
    ) internal pure returns (ProjectPojo memory newPojo) {
        newPojo = ProjectPojo({
            description: staticContent.description,
            ownerAddress: staticContent.owner,
            stakeRate100: staticContent.stakeRate100,
            maxTokenSoldCount: staticContent.maxTokenSoldCount,
            milestonesCount: staticContent.milestoneCount,
            milestones: milestones,
            thresholdMilestoneIndex: staticContent.thresholdIndex,
            coolDownInterval: staticContent.coolDownInterval,
            lastUpdateTimestamp: dynamicContent.lastUpdateTime,
            nextMilestone: dynamicContent.nextMilestoneIndex,
            remainTokenCount: dynamicContent.remainTokenCount,
            buyerCount: dynamicContent.buyerCount,
            creationTimestamp: blockTimestamp,
            status: "",
            stage: ""
        });
        // update status first
        if (dynamicContent.status == 0) {
            newPojo.status = "PENDING";
            newPojo.stage = "";
        } else if (dynamicContent.status == 1) {
            newPojo.status = "ONGOING";
            if (
                checkIfReadyToFinish(
                    staticContent,
                    dynamicContent,
                    blockTimestamp
                )
            ) {
                newPojo.stage = "Ready-To-Finish";
            } else if (
                checkIfThresholdMet(
                    staticContent,
                    dynamicContent,
                    blockTimestamp
                )
            ) {
                newPojo.stage = "Active";
            } else {
                newPojo.stage = "Open";
            }
        } else if (dynamicContent.status == 2) {
            newPojo.status = "FINISHED";
            newPojo.stage = "";
        } else {
            newPojo.status = "UNKNOWN";
            newPojo.stage = "";
        }
    }

    /// @notice Creates A new Milestone.
    /// @param title of the milestone.
    /// @param description of the milestone.
    /// @param endTimestamp of the milestone.
    /// @return newProjectMilestone .
    function createProjectMilestone(
        string memory title,
        string memory description,
        uint256 endTimestamp
    ) internal pure returns (ProjectMilestone memory newProjectMilestone) {
        newProjectMilestone = ProjectMilestone({
            title: title,
            description: description,
            endTimestamp: endTimestamp,
            proofOfWork: ""
        });
    }

    /// @notice ProjectMilestone.proofOfWork is considered a proof of milestone.
    /// @param projectMilestone.
    /// @return true if finished; false if not.
    function isFinished(
        ProjectMilestone memory projectMilestone
    ) internal pure returns (bool) {
        return (bytes(projectMilestone.proofOfWork).length != 0);
    }

    /// @notice When ProjectMilestone.proofOfWork is passed, then the milestone is considering as expired, and you can't change it anymore.
    /// @param projectMilestone.
    /// @return true if this milestone is already expired.
    function isExpired(
        ProjectMilestone memory projectMilestone,
        uint256 blockTimestamp
    ) internal pure returns (bool) {
        return projectMilestone.endTimestamp <= blockTimestamp;
    }
}
