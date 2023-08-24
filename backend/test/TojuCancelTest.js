const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const {
  projectCreationFixture,
  createAndPayProjectFixture,
} = require("../utils/fixtures");

describe("TojuCancelTest", function () {
  describe("Cancel", function () {
    it("Should revert when called with wrong Id", async function () {
      const { toju } = await loadFixture(projectCreationFixture);

      await expect(toju.cancelProject(2)).to.be.reverted;
    });

    it("Should revert with InvalidSignature when called by wrong owner", async function () {
      const { toju, projectId, otherAccount } = await loadFixture(
        projectCreationFixture
      );

      await expect(
        toju.connect(otherAccount).cancelProject(projectId)
      ).to.be.revertedWithCustomError(toju, "InvalidSignature");
    });

    it("Should not revert when a project is pending", async function () {
      const { toju, id1 } = await loadFixture(projectCreationFixture);

      await expect(toju.cancelProject(id1)).not.to.be.reverted;
    });

    it("Should not revert when a project is open", async function () {
      const {
        toju,
        id1,
        token,
        owner,
        buyerAccount1,
        buyerAccount2,
        ownerStakeAmount,
        buyer1Purchase,
        buyer2Purchase,
      } = await loadFixture(createAndPayProjectFixture);

      await expect(toju.cancelProject(id1)).to.changeTokenBalances(
        token,
        [owner, buyerAccount1, buyerAccount2],
        [ownerStakeAmount, buyer1Purchase, buyer2Purchase]
      );
    });

    it("Should revert with InvalidStageActive when a project is active", async function () {
      const { toju, id1 } = await loadFixture(createAndPayProjectFixture);
      await toju.finishMilestone(id1, 0, "something");

      await expect(toju.cancelProject(id1)).to.be.revertedWithCustomError(
        toju,
        "InvalidStageActive"
      );
    });

    it("Should revert with InvalidStatusAllowPendingAndOngoing when a project is finished", async function () {
      const { toju, projectInput, id1 } = await loadFixture(
        createAndPayProjectFixture
      );

      const { endTimestamps } = projectInput;

      // Increase the time so the last milestone can be expired so "finishProject" will not revert
      await time.increaseTo(endTimestamps[2]);

      await toju.finishProject(id1);

      await expect(toju.cancelProject(id1)).to.be.revertedWithCustomError(
        toju,
        "InvalidStatusAllowPendingAndOngoing"
      );
    });

    it("Should revert with InvalidSignature when called twice", async function () {
      const { toju, id1 } = await loadFixture(projectCreationFixture);

      await expect(toju.cancelProject(id1)).not.to.be.reverted;

      await expect(toju.cancelProject(id1)).to.be.revertedWithCustomError(
        toju,
        "InvalidSignature"
      );
    });

    it("Should emit CancelProject event", async function () {
      const { toju, id1 } = await loadFixture(projectCreationFixture);

      await expect(toju.cancelProject(id1))
        .to.emit(toju, "CancelProject")
        .withArgs(id1);
    });
  });
});
