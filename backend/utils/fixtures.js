const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

async function deployFixture() {
  const rightDeposit = ethers.parseEther("0.01");
  const [owner, otherAccount, buyerAccount1, buyerAccount2] =
    await ethers.getSigners();
  const maxSupply = ethers.parseEther("1000000");

  const TojuToken = await ethers.getContractFactory("TojuToken");
  const token = await TojuToken.deploy(maxSupply);

  const Toju = await ethers.getContractFactory("Toju");
  const toju = await Toju.deploy(token.getAddress());

  await token.mint({ value: rightDeposit });
  await token.connect(otherAccount).mint({ value: rightDeposit });
  await token.connect(buyerAccount1).mint({ value: rightDeposit });
  await token.connect(buyerAccount2).mint({ value: rightDeposit });

  return { toju, token, owner, otherAccount, buyerAccount1, buyerAccount2 };
}

async function projectCreationInputFixture() {
  const deployValues = await deployFixture();

  const projectDescription = "My Project Description";
  const id1 = 1;
  const stakeRate100 = ethers.parseUnits("10", "wei");
  const maxTokenSoldCount = ethers.parseEther("1000");
  const ONE_DAY_IN_SECS = 24 * 60 * 60;
  const milestoneTitles = ["title", "title", "title"];
  const milestoneDescriptions = ["Description", "Description", "Description"];
  const unlockTime1 = (await time.latest()) + ONE_DAY_IN_SECS;
  const unlockTime2 = (await time.latest()) + 2 * ONE_DAY_IN_SECS;
  const unlockTime3 = (await time.latest()) + 3 * ONE_DAY_IN_SECS;
  const endTimestamps = [unlockTime1, unlockTime2, unlockTime3];

  // Prepare ProjectInput data
  const projectInput = {
    projectDescription,
    stakeRate100,
    maxTokenSoldCount,
    milestoneTitles,
    milestoneDescriptions,
    endTimestamps,
    thresholdIndex: 0,
    coolDownInterval: 100,
  };

  return {
    ...deployValues,
    projectInput,
    id1,
  };
}

async function projectCreationFixture() {
  const projectCreationValues = await projectCreationInputFixture();
  const { toju, projectInput } = projectCreationValues;
  const { stakeRate100, maxTokenSoldCount } = projectInput;
  const percentDenominator = ethers.parseUnits("100", "wei");
  const ownerStakeAmount =
    (stakeRate100 * maxTokenSoldCount) / percentDenominator;
  result = await toju.declareProject(projectInput);
  const projectId = result.value;

  return {
    ...projectCreationValues,
    ownerStakeAmount,
    percentDenominator,
    projectId,
  };
}

async function createAndPayProjectFixture() {
  const projectCreationValues = await projectCreationFixture();
  const { toju, buyerAccount1, buyerAccount2, token, id1, ownerStakeAmount } =
    projectCreationValues;
  const tojuAddress = await toju.getAddress();

  const buyer1Purchase = ethers.parseEther("400");
  const buyer2Purchase = ethers.parseEther("500");

  await token.approve(tojuAddress, buyer2Purchase);
  await token.connect(buyerAccount1).approve(tojuAddress, buyer1Purchase);
  await token.connect(buyerAccount2).approve(tojuAddress, buyer2Purchase);

  await toju.onPayment(ownerStakeAmount, id1);
  await toju.connect(buyerAccount1).onPayment(buyer1Purchase, id1);
  await toju.connect(buyerAccount2).onPayment(buyer2Purchase, id1);

  return {
    ...projectCreationValues,
    ownerStakeAmount,
    buyer1Purchase,
    buyer2Purchase,
  };
}

module.exports = {
  createAndPayProjectFixture,
  projectCreationFixture,
  deployFixture,
  projectCreationInputFixture,
};
