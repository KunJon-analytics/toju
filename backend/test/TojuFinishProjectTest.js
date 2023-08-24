const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  deployFixture,
  projectCreationFixture,
  createAndPayProjectFixture,
} = require("../utils/fixtures");

describe("Toju", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  describe("FinishProject", function () {
    it("Should revert for invalid ID", async function () {
      const { toju } = await loadFixture(deployFixture);

      await expect(toju.finishProject(1)).to.be.reverted;
    });

    it("Should revert with InvalidStatusAllowOngoing for unpaid project", async function () {
      const { toju, id1 } = await loadFixture(projectCreationFixture);

      await expect(toju.finishProject(id1)).to.be.revertedWithCustomError(
        toju,
        "InvalidStatusAllowOngoing"
      );
    });

    it("Should revert with InvalidStageAllowReadyToFinish for not ready to finish project", async function () {
      const { toju, id1, otherAccount } = await loadFixture(
        createAndPayProjectFixture
      );

      await expect(
        toju.connect(otherAccount).finishProject(id1)
      ).to.be.revertedWithCustomError(toju, "InvalidStageAllowReadyToFinish");
    });

    it("Should not revert when called by project owner", async function () {
      const { toju, id1 } = await loadFixture(createAndPayProjectFixture);

      await expect(toju.finishProject(id1)).not.to.be.reverted;
    });

    it("Should revert with InvalidStatusAllowOngoing for double tx", async function () {
      const { toju, id1 } = await loadFixture(createAndPayProjectFixture);

      await expect(toju.finishProject(id1)).not.to.be.reverted;

      await expect(toju.finishProject(id1)).to.be.revertedWithCustomError(
        toju,
        "InvalidStatusAllowOngoing"
      );
    });

    it("Should revert with InvalidStatusAllowOngoing when last milestone is finished", async function () {
      const { toju, projectInput, id1 } = await loadFixture(
        createAndPayProjectFixture
      );
      const { endTimestamps } = projectInput;
      const unlockTime1 = endTimestamps[0];

      await toju.finishMilestone(id1, 0, "proofOfWork");
      // Increase the time so the cooldown period can elapse
      await time.increaseTo(unlockTime1);

      await toju.finishMilestone(id1, 1, "proofOfWork");
      // Increase the time so the cooldown period can elapse
      await time.increaseTo(unlockTime1 + 100);

      await toju.finishMilestone(id1, 2, "proofOfWork");

      await expect(toju.finishProject(id1)).to.be.revertedWithCustomError(
        toju,
        "InvalidStatusAllowOngoing"
      );
    });

    it("Should not revert if last milestone is expired", async function () {
      const { toju, projectInput, otherAccount, id1 } = await loadFixture(
        createAndPayProjectFixture
      );
      const { endTimestamps } = projectInput;

      // Increase the time so the last milestone can expire
      await time.increaseTo(endTimestamps[2]);

      await expect(toju.connect(otherAccount).finishProject(id1)).not.to.be
        .reverted;
    });

    it("Should distribute token correctly", async function () {
      const {
        toju,
        projectInput,
        token,
        owner,
        buyer1Purchase,
        buyer2Purchase,
        buyerAccount1,
        buyerAccount2,
        id1,
        percentDenominator,
      } = await loadFixture(createAndPayProjectFixture);
      const { stakeRate100, maxTokenSoldCount, endTimestamps } = projectInput;
      const unlockTime1 = endTimestamps[0];
      // buyer1: 400.00, buyer2: 500.00, remain: 100.0
      // finish ms [0] and [2], thus creator lose 1/3 token
      await toju.finishMilestone(id1, 0, "proofOfWork");
      // Increase the time so the cooldown period can elapse
      await time.increaseTo(unlockTime1);

      // buy this time:
      const buyer1Total =
        buyer1Purchase + (buyer1Purchase * stakeRate100) / percentDenominator;
      const buyer1Return = buyer1Total / ethers.parseUnits("3", "wei");
      const buyer2Total =
        buyer2Purchase + (buyer2Purchase * stakeRate100) / percentDenominator;
      const buyer2Return = buyer2Total / ethers.parseUnits("3", "wei");
      // creator get purchased and remain staked
      const creatorGet =
        buyer1Total -
        buyer1Return +
        (buyer2Total - buyer2Return) +
        ((maxTokenSoldCount - buyer1Purchase - buyer2Purchase) * stakeRate100) /
          percentDenominator;

      await expect(
        toju.finishMilestone(id1, 2, "proofOfWork")
      ).to.changeTokenBalances(
        token,
        [owner, buyerAccount1, buyerAccount2],
        [creatorGet, buyer1Return, buyer2Return]
      );
    });
  });
});
