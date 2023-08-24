const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const hre = require("hardhat");

describe("TojuToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTojuTokenFixture() {
    const rightDeposit = hre.ethers.parseEther("0.01");
    const wrongDeposit = hre.ethers.parseEther("0.001");
    const mintAmount = hre.ethers.parseEther("1000");
    const maxSupply = hre.ethers.parseEther("3000");

    // Contracts are deployed using the first signer/account by default
    const [owner, investor1, investor2] = await hre.ethers.getSigners();

    const TojuToken = await hre.ethers.getContractFactory("TojuToken");
    const tojuToken = await TojuToken.deploy(maxSupply);

    return {
      rightDeposit,
      wrongDeposit,
      owner,
      investor1,
      investor2,
      tojuToken,
      mintAmount,
    };
  }

  describe("Minting", function () {
    it("Should not mint with insufficient ETH", async function () {
      const { tojuToken, wrongDeposit } = await loadFixture(
        deployTojuTokenFixture
      );

      await expect(tojuToken.mint({ value: wrongDeposit })).to.be.revertedWith(
        "TOJU: insufficient token sent"
      );
    });

    it("Should not mint beyond maxSupply", async function () {
      const { tojuToken, rightDeposit, investor1, investor2 } =
        await loadFixture(deployTojuTokenFixture);

      await expect(tojuToken.mint({ value: rightDeposit })).not.to.be.reverted;

      await expect(tojuToken.connect(investor1).mint({ value: rightDeposit }))
        .not.to.be.reverted;

      await expect(tojuToken.connect(investor2).mint({ value: rightDeposit }))
        .not.to.be.reverted;

      await expect(tojuToken.mint({ value: rightDeposit })).to.be.reverted;
    });

    it("Should increase balance of investor", async function () {
      const { tojuToken, rightDeposit, owner, investor1, mintAmount } =
        await loadFixture(deployTojuTokenFixture);

      await expect(
        tojuToken.mint({ value: rightDeposit })
      ).to.changeTokenBalance(tojuToken, owner, mintAmount);

      await expect(
        tojuToken.connect(investor1).mint({ value: rightDeposit })
      ).to.changeTokenBalance(tojuToken, investor1, mintAmount);
    });

    it("Should increase totalSupply", async function () {
      const { tojuToken, rightDeposit, mintAmount } = await loadFixture(
        deployTojuTokenFixture
      );

      await tojuToken.mint({ value: rightDeposit });
      expect(await tojuToken.totalSupply()).to.equal(mintAmount);
    });
  });

  describe("withdrawTokens", function () {
    it("Should revert with aunauthorized account", async function () {
      const { tojuToken, rightDeposit, investor1, mintAmount } =
        await loadFixture(deployTojuTokenFixture);

      await tojuToken.mint({ value: rightDeposit });

      await expect(tojuToken.connect(investor1).withdrawTokens()).to.be
        .reverted;
    });

    it("Should increase onwers token", async function () {
      const { tojuToken, rightDeposit, owner, investor1 } = await loadFixture(
        deployTojuTokenFixture
      );

      await tojuToken.connect(investor1).mint({ value: rightDeposit });

      await expect(tojuToken.withdrawTokens()).to.changeEtherBalance(
        owner,
        rightDeposit
      );
    });
  });
});
