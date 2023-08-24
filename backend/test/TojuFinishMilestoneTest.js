const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const {
  deployFixture,
  projectCreationFixture,
  createAndPayProjectFixture,
} = require("../utils/fixtures");

describe("TojuFinishMilestoneTest", function () {
  describe("FinishMilestone", function () {
    it("Should revert for invalid ID", async function () {
      const { toju } = await loadFixture(deployFixture);

      await expect(toju.finishMilestone(1, 0, "proofOfWork")).to.be.reverted;
    });

    it("Should revert with InvalidSignature for invalid signer", async function () {
      const { toju, id1, otherAccount } = await loadFixture(
        createAndPayProjectFixture
      );

      await expect(
        toju.connect(otherAccount).finishMilestone(id1, 0, "proofOfWork")
      ).to.be.revertedWithCustomError(toju, "InvalidSignature");
    });

    it("Should revert with InvalidStatusAllowOngoing for unpaid project", async function () {
      const { toju, id1 } = await loadFixture(projectCreationFixture);

      await expect(
        toju.finishMilestone(id1, 0, "proofOfWork")
      ).to.be.revertedWithCustomError(toju, "InvalidStatusAllowOngoing");
    });

    it("Should revert with CoolDownTimeNotmet when cool down interval is not met", async function () {
      const { toju, id1 } = await loadFixture(createAndPayProjectFixture);

      await expect(toju.finishMilestone(id1, 0, "proofOfWork")).not.to.be
        .reverted;

      await expect(
        toju.finishMilestone(id1, 1, "proofOfWork")
      ).to.be.revertedWithCustomError(toju, "CoolDownTimeNotmet");
    });

    it("Should revert with InvalidMilestonePassed for missed milestone", async function () {
      const { toju, projectInput, id1 } = await loadFixture(
        createAndPayProjectFixture
      );
      const { endTimestamps } = projectInput;

      await expect(toju.finishMilestone(id1, 1, "proofOfWork")).not.to.be
        .reverted;

      // Increase the time so the cooldown period can elapse
      await time.increaseTo(endTimestamps[0] + 100);

      await expect(
        toju.finishMilestone(id1, 0, "proofOfWork")
      ).to.be.revertedWithCustomError(toju, "InvalidMilestonePassed");
    });

    it("Should revert with InvalidMilestonePassed for double tx", async function () {
      const { toju, projectInput, id1 } = await loadFixture(
        createAndPayProjectFixture
      );
      const { endTimestamps } = projectInput;

      await expect(toju.finishMilestone(id1, 0, "proofOfWork")).not.to.be
        .reverted;

      // Increase the time so the cooldown period can elapse
      await time.increaseTo(endTimestamps[0] + 100);

      await expect(
        toju.finishMilestone(id1, 0, "proofOfWork")
      ).to.be.revertedWithCustomError(toju, "InvalidMilestonePassed");
    });

    it("Should revert with InvalidMilestoneExpired for expired milestone", async function () {
      const { toju, projectInput, id1 } = await loadFixture(
        createAndPayProjectFixture
      );
      const { endTimestamps } = projectInput;

      // Increase the time so the milestone can expire
      await time.increaseTo(endTimestamps[2]);

      await expect(
        toju.finishMilestone(id1, 0, "proofOfWork")
      ).to.be.revertedWithCustomError(toju, "InvalidMilestoneExpired");
    });

    it("Should revert with InvalidProofOfWork for null proof of work", async function () {
      const { toju, id1 } = await loadFixture(createAndPayProjectFixture);

      await expect(
        toju.finishMilestone(id1, 0, "")
      ).to.be.revertedWithCustomError(toju, "InvalidProofOfWork");
    });

    it("Should emit FinishMilestone for a normal tx", async function () {
      const { toju, id1 } = await loadFixture(createAndPayProjectFixture);

      await expect(toju.finishMilestone(id1, 0, "proofOfWork"))
        .to.emit(toju, "FinishMilestone")
        .withArgs(id1, 0);
    });
  });
});
