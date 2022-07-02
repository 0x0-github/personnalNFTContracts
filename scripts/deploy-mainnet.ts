// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { SPECIAL_UNREVEAL_URI, UNREVEAL_URI } from "../utils/constants";
import { getWhitelistMerkleTree } from "../utils/whitelist-utils";
import { MoonLanderzNFT } from "../types";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const [deployer] = await ethers.getSigners();

  const merkleRoot = getWhitelistMerkleTree().getHexRoot();
  // Set to 27/05/22 4 PM
  const presaleStart = 1654610400;
  // Set to 28/05/22 0 AM
  const presaleEnd = 1654639200;

  const NFTContract = await ethers.getContractFactory("MoonLanderzNFT");
  const nftContract = await NFTContract.deploy(presaleStart, presaleEnd, UNREVEAL_URI, SPECIAL_UNREVEAL_URI, merkleRoot) as MoonLanderzNFT;

  await nftContract.deployed();

  console.log("MoonLanderzNFT deployed to:", nftContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
