const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

const { projectCreationInputFixture } = require("../utils/fixtures");

describe("TojuCreateTest", function () {
  describe("Create", function () {
    it("Should revert with InvalidStakeRate for a zero stake rate", async function () {
      const { toju, projectInput } = await loadFixture(
        projectCreationInputFixture
      );

      await expect(
        toju.declareProject({ ...projectInput, stakeRate100: 0 })
      ).to.be.revertedWithCustomError(toju, "InvalidStakeRate");
    });

    it("Should revert with InvalidMaxSellAmount for a zero token count", async function () {
      const { toju, projectInput } = await loadFixture(
        projectCreationInputFixture
      );

      await expect(
        toju.declareProject({ ...projectInput, maxTokenSoldCount: 0 })
      ).to.be.revertedWithCustomError(toju, "InvalidMaxSellAmount");
    });

    it("Should revert with InvalidMilestonesCount for shorter endTimestamps length", async function () {
      const { toju, projectInput } = await loadFixture(
        projectCreationInputFixture
      );

      await expect(
        toju.declareProject({
          ...projectInput,
          endTimestamps: [projectInput.endTimestamps[0]],
        })
      ).to.be.revertedWithCustomError(toju, "InvalidMilestonesCount");
    });

    it("Should revert with InvalidTimestamp for decreasing endTimestamps member", async function () {
      const { toju, projectInput } = await loadFixture(
        projectCreationInputFixture
      );

      const ONE_DAY_IN_SECS = 24 * 60 * 60;
      const unlockTime1 = (await time.latest()) + ONE_DAY_IN_SECS;

      await expect(
        toju.declareProject({
          ...projectInput,
          endTimestamps: [
            projectInput.endTimestamps[0],
            projectInput.endTimestamps[1],
            unlockTime1,
          ],
        })
      ).to.be.revertedWithCustomError(toju, "InvalidTimestamp");
    });

    it("Should revert with ExpiredTimestamp for a past endTimestamps member", async function () {
      const { toju, projectInput } = await loadFixture(
        projectCreationInputFixture
      );

      const ONE_DAY_IN_SECS = 24 * 60 * 60;
      const unlockTime1 = (await time.latest()) - ONE_DAY_IN_SECS;

      await expect(
        toju.declareProject({
          ...projectInput,
          endTimestamps: [
            unlockTime1,
            projectInput.endTimestamps[1],
            projectInput.endTimestamps[2],
          ],
        })
      ).to.be.revertedWithCustomError(toju, "ExpiredTimestamp");
    });

    it("Should revert with InvalidThresholdIndex for threshold index greater than milestones length", async function () {
      const { toju, projectInput } = await loadFixture(
        projectCreationInputFixture
      );

      await expect(
        toju.declareProject({ ...projectInput, thresholdIndex: 3 })
      ).to.be.revertedWithCustomError(toju, "InvalidThresholdIndex");
    });

    it("Should not revert for a normal operation", async function () {
      const { toju, projectInput } = await loadFixture(
        projectCreationInputFixture
      );

      await expect(toju.declareProject(projectInput)).not.to.be.reverted;
    });

    it("Should emit DeclareProject for a normal operation", async function () {
      const { toju, projectInput, owner, id1 } = await loadFixture(
        projectCreationInputFixture
      );

      const { milestoneTitles } = projectInput;

      await expect(toju.declareProject(projectInput))
        .to.emit(toju, "DeclareProject")
        .withArgs(owner.address, id1, milestoneTitles.length);
    });
  });
});
