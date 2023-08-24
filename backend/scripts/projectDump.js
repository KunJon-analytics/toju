// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { faker } = require("@faker-js/faker");

async function main() {
  const [owner, dev, washtrade] = await hre.ethers.getSigners();
  const signers = [owner, dev, washtrade];
  const tojuName = "Toju";
  const tojuAddr = "0xC7857Bd19b0D2b6b6CD343c104E56b15e6cE2031";
  const toju = await hre.ethers.getContractAt(tojuName, tojuAddr);
  let signer;
  for (let index = 0; index < signers.length; index++) {
    signer = signers[index];
    console.log("Declaring projects with address: ", signer.address);
    for (let i = 0; i < 5; i++) {
      await declareProject(toju, signer);
    }
  }
}

async function declareProject(toju, signer) {
  const TWENTY_DAYS = 24 * 60 * 60 * 20;
  const THIRTY_DAYS = 24 * 60 * 60 * 30;
  const ONE_DAY_IN_SECS = faker.number.int({
    max: THIRTY_DAYS,
    min: TWENTY_DAYS,
  });
  const unlockTime1 = Math.floor(Date.now() / 1000) + ONE_DAY_IN_SECS;
  const unlockTime2 = Math.floor(Date.now() / 1000) + 2 * ONE_DAY_IN_SECS;
  const unlockTime3 = Math.floor(Date.now() / 1000) + 3 * ONE_DAY_IN_SECS;
  const stakeRate100 = hre.ethers.parseUnits(faker.string.numeric(1), "wei");
  const maxTokenSoldCount = hre.ethers.parseEther(faker.string.numeric(2));
  const projectInput = {
    projectDescription: faker.lorem.paragraph({ min: 1, max: 3 }),
    stakeRate100,
    maxTokenSoldCount,
    milestoneTitles: [
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
    ],
    milestoneDescriptions: [
      faker.lorem.paragraph(1),
      faker.lorem.paragraph(1),
      faker.lorem.paragraph(1),
    ],
    endTimestamps: [unlockTime1, unlockTime2, unlockTime3],
    thresholdIndex: faker.number.int({
      max: 2,
      min: 0,
    }),
    coolDownInterval: faker.number.int({
      max: 1000,
      min: 100,
    }),
  };
  console.log(
    "Declaring project with description: ",
    projectInput.projectDescription
  );
  const tx = await toju.connect(signer).declareProject(projectInput);
  console.log(tx);
}

// Token address: 0xa65545Ea70Be846a6C782CA9dAFd5f8658ad1744
// Toju contract address: 0xC7857Bd19b0D2b6b6CD343c104E56b15e6cE2031

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
