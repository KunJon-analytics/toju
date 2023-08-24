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

describe("TojuRefundTest", function () {
  describe("Refund", function () {
    it("Should revert for invalid ID", async function () {
      const { toju } = await loadFixture(deployFixture);

      await expect(toju.refund(2)).to.be.reverted;
    });

    it("Should revert with InvalidStatusAllowOngoing for unpaid project", async function () {
      const { toju, id1 } = await loadFixture(projectCreationFixture);

      await expect(toju.refund(id1)).to.be.revertedWithCustomError(
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

      await expect(toju.refund(id1)).to.be.revertedWithCustomError(
        toju,
        "InvalidStatusAllowOngoing"
      );
    });

    it("Should revert with InvalidStageAllowReadyToFinish when last milestone is expired", async function () {
      const { toju, projectInput, id1 } = await loadFixture(
        createAndPayProjectFixture
      );

      const { endTimestamps } = projectInput;

      // Increase the time so the last milestone can expire
      await time.increaseTo(endTimestamps[2]);

      await expect(toju.refund(id1)).to.be.revertedWithCustomError(
        toju,
        "InvalidStageAllowReadyToFinish"
      );
    });

    it("Should revert with RecordNotFound when user has no purchase before threshold", async function () {
      const { toju, id1, otherAccount } = await loadFixture(
        createAndPayProjectFixture
      );

      await expect(
        toju.connect(otherAccount).refund(id1)
      ).to.be.revertedWithCustomError(toju, "RecordNotFound");
    });

    it("Should revert with RecordNotFound when user has no purchase after threshold", async function () {
      const { toju, id1, otherAccount } = await loadFixture(
        createAndPayProjectFixture
      );

      await toju.finishMilestone(id1, 0, "proofOfWork");

      await expect(
        toju.connect(otherAccount).refund(id1)
      ).to.be.revertedWithCustomError(toju, "RecordNotFound");
    });

    it("Should make full refund before threshold", async function () {
      const { toju, id1, buyerAccount1, buyer1Purchase, token } =
        await loadFixture(createAndPayProjectFixture);

      await expect(
        toju.connect(buyerAccount1).refund(id1)
      ).to.changeTokenBalance(token, buyerAccount1, buyer1Purchase);
    });

    it("Should emit Refund for valid tx before threshold", async function () {
      const { toju, id1, buyerAccount1, buyer1Purchase } = await loadFixture(
        createAndPayProjectFixture
      );

      await expect(toju.connect(buyerAccount1).refund(id1))
        .to.emit(toju, "Refund")
        .withArgs(buyerAccount1.address, id1, buyer1Purchase, 0);
    });

    it("Should make partial refund after threshold", async function () {
      const { toju, id1, buyerAccount1, buyer1Purchase, token, owner } =
        await loadFixture(createAndPayProjectFixture);

      await toju.finishMilestone(id1, 0, "proofOfWork");
      const creatorAmount = buyer1Purchase / 3n;
      const buyerRefund = buyer1Purchase - creatorAmount;

      await expect(
        toju.connect(buyerAccount1).refund(id1)
      ).to.changeTokenBalances(
        token,
        [buyerAccount1, owner],
        [buyerRefund, creatorAmount]
      );
    });

    it("Should emit Refund for valid tx after threshold", async function () {
      const { toju, id1, buyerAccount1, buyer1Purchase } = await loadFixture(
        createAndPayProjectFixture
      );

      await toju.finishMilestone(id1, 0, "proofOfWork");
      const creatorAmount = buyer1Purchase / 3n;
      const buyerRefund = buyer1Purchase - creatorAmount;

      await expect(toju.connect(buyerAccount1).refund(id1))
        .to.emit(toju, "Refund")
        .withArgs(buyerAccount1.address, id1, buyerRefund, creatorAmount);
    });
  });
});
