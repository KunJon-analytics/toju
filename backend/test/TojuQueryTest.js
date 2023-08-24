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

describe("TojuQueryTest", function () {
  describe("Query", function () {
    it("Should return 0 for an invalid ID query purchase", async function () {
      const { toju, otherAccount } = await loadFixture(deployFixture);

      expect(await toju.queryPurchase(2, otherAccount.address)).to.equal(0);
    });

    it("Should not revert with valid ID", async function () {
      const { toju, otherAccount, id1 } = await loadFixture(
        projectCreationFixture
      );

      await expect(toju.queryProjectProto(id1)).not.to.be.reverted;

      await expect(toju.queryPurchase(id1, otherAccount.address)).not.to.be
        .reverted;
    });

    it("Should return 0 for an invalid buyer query purchase", async function () {
      const { toju, otherAccount, id1 } = await loadFixture(
        createAndPayProjectFixture
      );

      expect(await toju.queryPurchase(id1, otherAccount.address)).to.equal(0);
    });

    it("Should return amount bought for valid buyer query purchase", async function () {
      const { toju, buyer1Purchase, buyerAccount1, id1 } = await loadFixture(
        createAndPayProjectFixture
      );

      expect(await toju.queryPurchase(id1, buyerAccount1.address)).to.equal(
        buyer1Purchase
      );
    });

    it("Should return valid response when queryProjectProto is called", async function () {
      const { toju, projectInput, id1, owner } = await loadFixture(
        createAndPayProjectFixture
      );
      const { projectDescription } = projectInput;

      const result = await toju.queryProjectProto(id1);

      expect(result[0]).to.equal(projectDescription);
      expect(result[1]).to.equal(owner.address);
    });
  });
});
