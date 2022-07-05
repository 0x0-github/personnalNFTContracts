import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import { NetworkUserConfig } from "hardhat/types";

dotenv.config();

const chainIds = {
  hardhat: { id: 31337, rpc: "" },
  mainnet: { id: +process.env.MAINNET_ID!, rpc: process.env.MAINNET_URL },
  testnet: { id: +process.env.TESTNET_ID!, rpc: process.env.TESTNET_URL },
  bsc_testnet: { id: 97, rpc: "https://data-seed-prebsc-1-s1.binance.org:8545/" },
};
// Ensure that we have all the environment variables we need.
const privateKey: string | undefined = process.env.PRIVATE_KEY ?? "NO_PRIVATE_KEY";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

function getChainConfig(network: keyof typeof chainIds): NetworkUserConfig {
  return {
    accounts: [`${privateKey}`],
    chainId: chainIds[network].id,
    url: chainIds[network].rpc,
  };
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    mainnet: getChainConfig("mainnet"),
    testnet: getChainConfig("testnet"),
    bsc_testnet: getChainConfig("bsc_testnet"),
  },
  solidity: {
    compilers: [
      {
        version: "0.8.15",
      },
      {
        version: "0.8.4",
      },
    ],
    settings: {
      optimizer: {
        enabled: false,
        runs: 500,
      },
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    deploy: "./scripts/deploy",
    deployments: "./deployments",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
