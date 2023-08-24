// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const token = "0xa65545Ea70Be846a6C782CA9dAFd5f8658ad1744";
  const contractAddress = "0xC7857Bd19b0D2b6b6CD343c104E56b15e6cE2031";

  console.log("Deployed contracts with token:", token);

  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [token],
  });
}

// Token address: 0xa65545Ea70Be846a6C782CA9dAFd5f8658ad1744
// Toju contract address: 0xC7857Bd19b0D2b6b6CD343c104E56b15e6cE2031

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
