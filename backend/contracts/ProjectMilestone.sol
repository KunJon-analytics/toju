// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

struct ProjectMilestone {
    /**
     * The title of this milestone
     */
    string title;
    /**
     * The description of this milestone
     */
    string description;
    /**
     * The end, or expiry timestamp of this milestone
     */
    uint256 endTimestamp;
    /**
     * The proof of work, or the result of this milestone.
     * Null if not finished yet.
     */
    string proofOfWork;
}
