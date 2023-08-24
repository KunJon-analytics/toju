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

describe("TojuPurchaseTest", function () {
  describe("onPayment", function () {
    it("Should revert for invalid ID", async function () {
      const { toju } = await loadFixture(deployFixture);

      await expect(toju.onPayment(ethers.parseEther("0.01"), 1)).to.be.reverted;
    });

    it("Should revert for failed payment", async function () {
      const { toju, token, id1 } = await loadFixture(projectCreationFixture);
      const tojuAddress = await toju.getAddress();
      await token.approve(tojuAddress, ethers.parseEther("100"));

      await expect(toju.onPayment(ethers.parseEther("500"), id1)).to.be
        .reverted;
    });

    it("Should revert with InvalidStatusAllowPending for double payment of stake by owner", async function () {
      const { toju, id1 } = await loadFixture(createAndPayProjectFixture);

      await expect(
        toju.onPayment(ethers.parseEther("0.01"), id1)
      ).to.be.revertedWithCustomError(toju, "InvalidStatusAllowPending");
    });

    it("Should revert for wrong owner stake payment", async function () {
      const { toju, token, ownerStakeAmount, id1 } = await loadFixture(
        projectCreationFixture
      );
      const tojuAddress = await toju.getAddress();
      await token.approve(tojuAddress, ethers.parseEther("500"));

      const inCorrectAmount = ethers.parseEther("200");

      await expect(toju.onPayment(inCorrectAmount, id1))
        .to.be.revertedWithCustomError(toju, "InCorrectAmount")
        .withArgs(inCorrectAmount, ownerStakeAmount);
    });

    it("Should not revert for normal owner stake", async function () {
      const { toju, token, ownerStakeAmount, id1 } = await loadFixture(
        projectCreationFixture
      );
      const tojuAddress = await toju.getAddress();
      await token.approve(tojuAddress, ethers.parseEther("500"));

      await expect(toju.onPayment(ownerStakeAmount, id1)).not.to.be.reverted;
    });

    it("Should emit PayStake for normal owner stake", async function () {
      const { toju, id1, token, ownerStakeAmount, owner } = await loadFixture(
        projectCreationFixture
      );
      const tojuAddress = await toju.getAddress();
      await token.approve(tojuAddress, ethers.parseEther("500"));

      await expect(toju.onPayment(ownerStakeAmount, id1))
        .to.emit(toju, "PayStake")
        .withArgs(owner.address, id1, ownerStakeAmount);
    });

    it("Should revert with InvalidStatusAllowOngoing for user buying unpaid project", async function () {
      const { toju, id1, token, ownerStakeAmount, buyerAccount1 } =
        await loadFixture(projectCreationFixture);
      const tojuAddress = await toju.getAddress();
      await token
        .connect(buyerAccount1)
        .approve(tojuAddress, ethers.parseEther("500"));

      await expect(
        toju.connect(buyerAccount1).onPayment(ownerStakeAmount, id1)
      ).to.be.revertedWithCustomError(toju, "InvalidStatusAllowOngoing");
    });

    it("Should revert with InvalidStageReadyToFinish for user buying a ready to finish project", async function () {
      const { toju, projectInput, id1, token, ownerStakeAmount, otherAccount } =
        await loadFixture(createAndPayProjectFixture);
      const { endTimestamps } = projectInput;
      const tojuAddress = await toju.getAddress();
      await token
        .connect(otherAccount)
        .approve(tojuAddress, ethers.parseEther("500"));

      await time.increaseTo(endTimestamps[2]);

      await expect(
        toju.connect(otherAccount).onPayment(ownerStakeAmount, id1)
      ).to.be.revertedWithCustomError(toju, "InvalidStageReadyToFinish");
    });

    it("Should revert with InsufficientAmountRemain for excess token paid by buyer", async function () {
      const {
        toju,
        projectInput,
        id1,
        token,
        otherAccount,
        buyer1Purchase,
        buyer2Purchase,
      } = await loadFixture(createAndPayProjectFixture);
      const { maxTokenSoldCount } = projectInput;
      const tojuAddress = await toju.getAddress();
      const sent = ethers.parseEther("500");
      const remaining = maxTokenSoldCount - (buyer1Purchase + buyer2Purchase);
      await token.connect(otherAccount).approve(tojuAddress, sent);

      await expect(toju.connect(otherAccount).onPayment(sent, id1))
        .to.be.revertedWithCustomError(toju, "InsufficientAmountRemain")
        .withArgs(sent, remaining);
    });

    it("Should emit PurchaseProject for one time normal user purchase", async function () {
      const { toju, projectInput, id1, token, ownerStakeAmount, otherAccount } =
        await loadFixture(projectCreationFixture);
      const { maxTokenSoldCount } = projectInput;
      const tojuAddress = await toju.getAddress();
      await token.approve(tojuAddress, ethers.parseEther("500"));
      await token
        .connect(otherAccount)
        .approve(tojuAddress, ethers.parseEther("1000"));
      await toju.onPayment(ownerStakeAmount, id1);

      await expect(toju.connect(otherAccount).onPayment(maxTokenSoldCount, id1))
        .to.emit(toju, "PurchaseProject")
        .withArgs(otherAccount.address, id1, maxTokenSoldCount);
    });
  });
});
