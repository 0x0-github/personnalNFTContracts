// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { NFTContract } from "../types";
import { getWhitelistMerkleTree } from "../utils/whitelist-utils";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const [deployer] = await ethers.getSigners();

  const merkleRoot = getWhitelistMerkleTree().getHexRoot();

  // const NFTContract = await ethers.getContractAt("TestNFT", "0xF38828d895a1AA00ea45F8dfa2Caf04494b77477") as TestNFT;

  // await waitFor(NFTContract.connect(deployer).teamMint(BigNumber.from(145), deployer.address));
  const nftContractAddr = "";
  let nftContract;

  if (nftContractAddr === "") {
    const NFTContract = await ethers.getContractFactory("NFTContract");
    nftContract = await NFTContract.deploy(0, merkleRoot) as NFTContract;
  
    await nftContract.deployed();
  
    console.log("NFTContract deployed to:", nftContract.address);
  } else {
    nftContract = await ethers.getContractAt("NFTContract", nftContractAddr) as NFTContract;
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
