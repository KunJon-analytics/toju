// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import {ProjectDynamicContent} from "./ProjectDynamicContent.sol";
import {ExceptionMessages} from "./ExceptionMessages.sol";
import {ProjectStaticContent, ProjectInput} from "./ProjectStaticContent.sol";
import {TojuLibrary} from "./TojuLibrary.sol";
import {TojuToken} from "./TojuToken.sol";
import {ProjectPojo} from "./ProjectPojo.sol";
import {ProjectMilestone} from "./ProjectMilestone.sol";

contract Toju is Ownable {
    // GLOBAL STATE VARIABLES
    TojuToken tojuToken;
    uint256 public counter;
    mapping(uint256 => ProjectStaticContent) projectStaticContentMap;
    mapping(uint256 => ProjectDynamicContent) projectDynamicContentMap;
    mapping(uint256 => ProjectMilestone[]) projectMilestonesMap;
    mapping(uint256 => address[]) public projectBuyers;
    mapping(uint256 => mapping(address => uint256)) projectPurchaseRecordMap;

    // EVENTS
    event DeclareProject(
        address indexed creator,
        uint256 indexed projectId,
        uint8 milestoneCount
    );
    event PayStake(
        address indexed owner,
        uint256 indexed projectId,
        uint256 amount
    );
    event PurchaseProject(
        address indexed buyer,
        uint256 indexed projectId,
        uint256 dealAmount
    );
    event FinishMilestone(uint256 indexed projectId, uint8 milestoneIndex);
    event FinishProject(uint256 indexed projectId);
    event Refund(
        address indexed buyer,
        uint256 indexed projectId,
        uint256 buyerAmount,
        uint256 toCreatorAmount
    );
    event CancelProject(uint256 indexed projectId);

    constructor(TojuToken _tojuToken) {
        tojuToken = _tojuToken;
    }

    function onPayment(uint256 amount, uint256 projectId) external {
        ProjectStaticContent memory staticContent = getStaticContent(projectId);
        ProjectDynamicContent memory dynamicContent = getDynamicContent(
            projectId
        );
        // pull the tokens from the msg.sender using transferFrom
        bool success = tojuToken.transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (!success) {
            revert ExceptionMessages.FailedTransfer();
        }
        if (staticContent.owner == msg.sender) {
            // owner paying stake
            if (dynamicContent.status != 0) {
                revert ExceptionMessages.InvalidStatusAllowPending();
            }
            if (TojuLibrary.getTotalStake(staticContent) != amount) {
                revert ExceptionMessages.InCorrectAmount({
                    sent: amount,
                    required: TojuLibrary.getTotalStake(staticContent)
                });
            }
            // unpaid before, amount is correct, set to ONGOING
            dynamicContent.status = 1;
            emit PayStake(msg.sender, projectId, amount);
        } else {
            if (dynamicContent.status != 1) {
                revert ExceptionMessages.InvalidStatusAllowOngoing();
            }
            if (
                TojuLibrary.checkIfReadyToFinish(
                    staticContent,
                    dynamicContent,
                    block.timestamp
                )
            ) {
                revert ExceptionMessages.InvalidStageReadyToFinish();
            }
            if (dynamicContent.remainTokenCount < amount) {
                revert ExceptionMessages.InsufficientAmountRemain({
                    sent: amount,
                    remaining: dynamicContent.remainTokenCount
                });
            }
            dynamicContent.remainTokenCount -= amount;
            dynamicContent.totalPurchasedAmount += amount;
            // update purchase record
            uint256 value = projectPurchaseRecordMap[projectId][msg.sender];
            if (value == 0) {
                // new purchase
                dynamicContent.buyerCount++;
                projectBuyers[projectId].push(msg.sender);
            }
            value += amount;
            projectPurchaseRecordMap[projectId][msg.sender] = value;
            emit PurchaseProject(msg.sender, projectId, amount);
        }
        updateDynamicContent(projectId, dynamicContent);
    }

    function queryProjectProto(
        uint256 projectId
    ) public view returns (ProjectPojo memory projectPojo) {
        ProjectStaticContent memory staticContent = getStaticContent(projectId);
        ProjectDynamicContent memory dynamicContent = getDynamicContent(
            projectId
        );
        ProjectMilestone[] memory milestones = getMilestones(projectId);

        projectPojo = TojuLibrary.createPojo(
            staticContent,
            dynamicContent,
            milestones,
            block.timestamp
        );
    }

    function queryPurchase(
        uint256 projectId,
        address buyer
    ) external view returns (uint256 value) {
        value = projectPurchaseRecordMap[projectId][buyer];
    }

    function declareProject(
        ProjectInput calldata input
    ) external returns (uint256 projectId) {
        counter++; // update counter
        projectId = counter;
        // save project id

        if (bytes(input.projectDescription).length == 0) {
            revert ExceptionMessages.NullDescription();
        }
        if (input.stakeRate100 < 1) {
            revert ExceptionMessages.InvalidStakeRate();
        }
        if (input.maxTokenSoldCount < 1) {
            revert ExceptionMessages.InvalidMaxSellAmount();
        }

        // check milestone
        uint256 milestoneCount = input.endTimestamps.length;
        if (input.milestoneTitles.length != milestoneCount) {
            revert ExceptionMessages.InvalidMilestonesCount();
        }
        if (input.milestoneDescriptions.length != milestoneCount) {
            revert ExceptionMessages.InvalidMilestonesCount();
        }

        uint256 lastTimestamp = 0;
        if (input.endTimestamps[0] <= block.timestamp) {
            revert ExceptionMessages.ExpiredTimestamp();
        }
        for (uint256 i = 0; i < milestoneCount; i++) {
            uint256 t = input.endTimestamps[i];
            if (lastTimestamp >= t) {
                revert ExceptionMessages.InvalidTimestamp();
            }
            lastTimestamp = t;
            string memory currentTitle = input.milestoneTitles[i];
            string memory currentDescription = input.milestoneDescriptions[i];
            addMilestone(
                projectId,
                TojuLibrary.createProjectMilestone(
                    currentTitle,
                    currentDescription,
                    t
                )
            );
        }
        if (input.thresholdIndex >= milestoneCount) {
            revert ExceptionMessages.InvalidThresholdIndex();
        }
        if (input.coolDownInterval <= 0) {
            revert ExceptionMessages.InvalidCoolDownInterval();
        }

        // create project info obj and store

        projectStaticContentMap[projectId] = TojuLibrary.createStaticContent(
            msg.sender,
            input.projectDescription,
            input.stakeRate100,
            input.maxTokenSoldCount,
            uint8(milestoneCount),
            input.thresholdIndex,
            input.coolDownInterval,
            input.endTimestamps[input.thresholdIndex],
            input.endTimestamps[milestoneCount - 1],
            block.timestamp
        );
        updateDynamicContent(
            projectId,
            TojuLibrary.createDynamicContent(input.maxTokenSoldCount)
        );
        // fire event and done
        emit DeclareProject(msg.sender, projectId, uint8(milestoneCount));
        return projectId;
    }

    function finishMilestone(
        uint256 projectId,
        uint8 index,
        string calldata proofOfWork
    ) external {
        ProjectStaticContent memory staticContent = getStaticContent(projectId);
        // only creator can update project to finished
        if (msg.sender != staticContent.owner) {
            revert ExceptionMessages.InvalidSignature();
        }
        ProjectDynamicContent memory dynamicContent = getDynamicContent(
            projectId
        );
        if (dynamicContent.status != 1) {
            revert ExceptionMessages.InvalidStatusAllowOngoing();
        }
        ProjectMilestone memory ms = getMilestone(projectId, index);
        // check cool-down time first
        uint256 currentTime = block.timestamp;
        if (
            (dynamicContent.lastUpdateTime + staticContent.coolDownInterval) >
            currentTime
        ) {
            revert ExceptionMessages.CoolDownTimeNotmet();
        }
        if (index < dynamicContent.nextMilestoneIndex) {
            revert ExceptionMessages.InvalidMilestonePassed();
        }
        if (TojuLibrary.isFinished(ms)) {
            revert ExceptionMessages.InvalidMilestoneFinished();
        }
        if (TojuLibrary.isExpired(ms, block.timestamp)) {
            revert ExceptionMessages.InvalidMilestoneExpired();
        }
        // not finished nor expired, then we can modify it.
        if (bytes(proofOfWork).length == 0) {
            revert ExceptionMessages.InvalidProofOfWork();
        }
        ms.proofOfWork = proofOfWork;
        dynamicContent.nextMilestoneIndex = index + 1;
        dynamicContent.finishedMilestoneCount++;
        dynamicContent.lastUpdateTime = currentTime;
        if (index >= staticContent.thresholdIndex) {
            // in case creator skip the threshold milestone
            dynamicContent.thresholdMilestonePassed = true;
        }
        if (index == staticContent.milestoneCount - 1) {
            dynamicContent.lastMilestoneFinished = true;
        }

        // store it back
        updateDynamicContent(projectId, dynamicContent);
        updateMilestone(projectId, index, ms);
        emit FinishMilestone(projectId, index);

        // if whole project is finished
        if (
            TojuLibrary.checkIfReadyToFinish(
                staticContent,
                dynamicContent,
                block.timestamp
            )
        ) {
            finishProject(projectId);
        }
    }

    function finishProject(uint256 projectId) public {
        ProjectStaticContent memory staticContent = getStaticContent(projectId);
        ProjectDynamicContent memory dynamicContent = getDynamicContent(
            projectId
        );
        if (dynamicContent.status != 1) {
            revert ExceptionMessages.InvalidStatusAllowOngoing();
        }
        // only owner can finish an unfinished project
        // otherwise, other one can only finish ready-to-finished
        if (
            msg.sender != staticContent.owner &&
            !TojuLibrary.checkIfReadyToFinish(
                staticContent,
                dynamicContent,
                block.timestamp
            )
        ) {
            revert ExceptionMessages.InvalidStageAllowReadyToFinish();
        }

        // Update status first to prevent re-entry attack
        dynamicContent.status = 2;
        dynamicContent.lastUpdateTime = block.timestamp;
        updateDynamicContent(projectId, dynamicContent);
        // At this time, the project is finished, no more operation is allowed

        uint256 remainTokens = TojuLibrary.getTotalStake(staticContent) +
            dynamicContent.totalPurchasedAmount;
        uint8 totalMilestones = staticContent.milestoneCount;
        uint8 unfinishedMilestones = totalMilestones -
            dynamicContent.finishedMilestoneCount;

        // If there are unfinished milestone, refund
        if (unfinishedMilestones != 0) {
            // for each buyer, return their token based on unfinished ms count
            // also remove stakes for that unfinished one
            address[] memory currentBuyers = projectBuyers[projectId];
            for (uint i = 0; i < currentBuyers.length; i++) {
                address buyer = currentBuyers[i];
                uint256 purchaseAmount = projectPurchaseRecordMap[projectId][
                    buyer
                ];
                uint256 totalAmount = purchaseAmount +
                    (purchaseAmount * staticContent.stakeRate100) /
                    100;
                uint256 returnAmount = (totalAmount * unfinishedMilestones) /
                    totalMilestones;
                transferTokenTo(buyer, returnAmount);
                remainTokens -= returnAmount;
            }
        }
        // considering all decimals are floored, so totalTokens > 0
        // return the reset of total tokens to creator
        if (remainTokens > 0) {
            transferTokenTo(staticContent.owner, remainTokens);
        }
        emit FinishProject(projectId);
    }

    function refund(uint256 projectId) external {
        ProjectStaticContent memory staticContent = getStaticContent(projectId);
        ProjectDynamicContent memory dynamicContent = getDynamicContent(
            projectId
        );
        if (dynamicContent.status != 1) {
            revert ExceptionMessages.InvalidStatusAllowOngoing();
        }
        if (
            TojuLibrary.checkIfReadyToFinish(
                staticContent,
                dynamicContent,
                block.timestamp
            )
        ) {
            revert ExceptionMessages.InvalidStageAllowReadyToFinish();
        }

        uint256 value = projectPurchaseRecordMap[projectId][msg.sender];
        if (value == 0) {
            revert ExceptionMessages.RecordNotFound();
        }
        // After get the purchase record, delete it.
        // Re-entry attack will get record not found exception at next call.
        projectPurchaseRecordMap[projectId][msg.sender] = 0;

        if (
            TojuLibrary.checkIfThresholdMet(
                staticContent,
                dynamicContent,
                block.timestamp
            )
        ) {
            // after the threshold
            (uint256 toBuyerAmount, uint256 toCreatorAmount) = TojuLibrary
                .partialRefund(dynamicContent, staticContent, value);
            transferTokenTo(msg.sender, toBuyerAmount);
            transferTokenTo(staticContent.owner, toCreatorAmount);
            emit Refund(msg.sender, projectId, toBuyerAmount, toCreatorAmount);
        } else {
            // full refund
            uint256 amount = TojuLibrary.fullRefund(dynamicContent, value);
            transferTokenTo(msg.sender, amount);
            emit Refund(msg.sender, projectId, amount, 0);
        }
        // update buyer info
        updateDynamicContent(projectId, dynamicContent);
    }

    function cancelProject(uint256 projectId) external {
        // get obj and delete
        ProjectStaticContent memory staticContent = getStaticContent(projectId);
        projectStaticContentMap[projectId] = projectStaticContentMap[0];
        ProjectDynamicContent memory dynamicContent = getDynamicContent(
            projectId
        );
        projectDynamicContentMap[projectId] = projectDynamicContentMap[0];

        // check signature
        if (msg.sender != staticContent.owner) {
            revert ExceptionMessages.InvalidSignature();
        }
        // check status
        if (dynamicContent.status == 0) {
            // PENDING, nothing to do
        } else if (dynamicContent.status == 1) {
            // ONGOING, check threshold
            if (
                TojuLibrary.checkIfThresholdMet(
                    staticContent,
                    dynamicContent,
                    block.timestamp
                )
            ) {
                revert ExceptionMessages.InvalidStageActive();
            }
            // to creator
            transferTokenTo(
                staticContent.owner,
                TojuLibrary.getTotalStake(staticContent)
            );
            // to buyers
            address[] memory currentBuyers = projectBuyers[projectId];
            for (uint i = 0; i < currentBuyers.length; i++) {
                address buyer = currentBuyers[i];
                uint256 purchaseAmount = projectPurchaseRecordMap[projectId][
                    buyer
                ];
                projectPurchaseRecordMap[projectId][buyer] = 0;
                transferTokenTo(buyer, purchaseAmount);
            }
        } else {
            // Cancel is not available for the rest of status
            revert ExceptionMessages.InvalidStatusAllowPendingAndOngoing();
        }
        // delete milestones
        delete projectMilestonesMap[projectId];

        emit CancelProject(projectId);
    }

    // ---------- Internal functions ----------

    function getStaticContent(
        uint256 projectId
    ) private view returns (ProjectStaticContent memory staticContent) {
        staticContent = projectStaticContentMap[projectId];
    }

    function getDynamicContent(
        uint256 projectId
    ) private view returns (ProjectDynamicContent memory dynamicContent) {
        dynamicContent = projectDynamicContentMap[projectId];
    }

    function updateDynamicContent(
        uint256 projectId,
        ProjectDynamicContent memory data
    ) private {
        projectDynamicContentMap[projectId] = data;
    }

    function getMilestones(
        uint256 projectId
    ) private view returns (ProjectMilestone[] memory result) {
        result = projectMilestonesMap[projectId];
    }

    function getMilestone(
        uint256 projectId,
        uint256 index
    ) private view returns (ProjectMilestone memory data) {
        data = projectMilestonesMap[projectId][index];
        return data;
    }

    function updateMilestone(
        uint256 projectId,
        uint256 index,
        ProjectMilestone memory data
    ) private {
        projectMilestonesMap[projectId][index] = data;
    }

    function addMilestone(
        uint256 projectId,
        ProjectMilestone memory data
    ) private {
        projectMilestonesMap[projectId].push(data);
    }

    function transferTokenTo(address target, uint256 amount) private {
        bool success = tojuToken.transfer(target, amount);
        if (!success) {
            revert ExceptionMessages.FailedTransfer();
        }
    }
}
