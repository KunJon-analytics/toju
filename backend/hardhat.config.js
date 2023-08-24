require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

task("mint", "Mints TOJU to an account")
  .addParam("key", "The account's private key")
  .setAction(async (taskArgs, hre) => {
    // attach to the token
    const contractName = "TojuToken";
    const tokenAddr = "0xa65545Ea70Be846a6C782CA9dAFd5f8658ad1744";
    const token = await hre.ethers.getContractAt(contractName, tokenAddr);
    const rightDeposit = hre.ethers.parseEther("0.01");

    const wallet = new hre.ethers.Wallet(taskArgs.key);
    const signer = await wallet.connect(hre.ethers.provider);

    // do whatever you need to do to win the token here:

    const oldBalance = await token.balanceOf(wallet.address);

    console.log("TOJU old balance: ", oldBalance);

    const tx = await token.connect(signer).mint({ value: rightDeposit });

    // did you mint? Check the transaction receipt!
    // if you did, it will be in both the logs and events array
    const receipt = await tx.wait();
    console.log(receipt);

    const newBalance = await token.balanceOf(wallet.address);

    console.log("TOJU new balance: ", newBalance);
  });

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  allowUnlimitedContractSize: true,
  networks: {
    hardhat: {},
    ETH_MAINNET: {
      accounts: [`${process.env.PRIVATE_KEY}`],
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    },
    ETH_GOERLI: {
      accounts: [`${process.env.PRIVATE_KEY}`],
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    },
    ETH_SEPOLIA: {
      accounts: [
        `${process.env.PRIVATE_KEY}`,
        `${process.env.DEV_PRIVATE_KEY}`,
        `${process.env.WASHTRADE_PRIVATE_KEY}`,
      ],
      url: process.env.SEPOLIA_TESTNET_RPC_URL,
    },
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
  },
  paths: {
    artifacts: "../frontend/artifacts",
  },
};
