// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { SPECIAL_UNREVEAL_URI, UNREVEAL_URI } from "../utils/constants";
import { getWhitelistMerkleTree } from "../utils/banner-whitelist-utils";
import { FreeClaim, TestMoonBase, TestNFT } from "../types";
import { waitFor } from "../utils/tx-helper";
import { BigNumber } from "ethers";
import { solidityKeccak256 } from "ethers/lib/utils";

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
    const NFTContract = await ethers.getContractFactory("TestNFT");
    nftContract = await NFTContract.deploy(0, 0, merkleRoot) as TestNFT;
  
    await nftContract.deployed();
  
    console.log("MLZ deployed to:", nftContract.address);
  } else {
    nftContract = await ethers.getContractAt("TestNFT", nftContractAddr) as TestNFT;
  }
  
  const moonBaseAddr = "";
  let moonBase;

  if (moonBaseAddr === "") {
    const MoonBase = await ethers.getContractFactory("TestMoonBase");
    moonBase = await MoonBase.deploy(nftContract.address) as TestMoonBase;

    await moonBase.deployed();

    console.log("MoonBase deployed to:", moonBase.address);

    await waitFor(deployer.sendTransaction({
      to: moonBase.address,
      value: "10000"
    }));

    await waitFor(moonBase.mintBatches(100, { gasLimit: 2000000 }));

    await waitFor(moonBase.updateCurrentMintId(1));
    await waitFor(moonBase.updateMaxMintTx(10000));
    await waitFor(moonBase.updateMintPaused(true));
  } else {
    moonBase = await ethers.getContractAt("TestMoonBase", moonBaseAddr);
  }

  const FreeClaim = await ethers.getContractFactory("FreeClaim");
  const freeClaim = await FreeClaim.deploy(moonBase.address, nftContract.address) as FreeClaim;

  await freeClaim.deployed();

  console.log("FreeClaim deployed to:", freeClaim.address);

  const merkleTree = getWhitelistMerkleTree();
  const address = "0xcF176AE921BF3A4A4C7CD8010Fc52457A128DE22";
  const amount = 3;

  console.log("MERKLE ROOT");
  console.log(merkleTree.getHexRoot());
  console.log("PROOF");
  console.log(merkleTree.getHexProof(solidityKeccak256(["address", "uint256"], [address, amount])));

  await waitFor(freeClaim.setMerkleRoot(merkleTree.getHexRoot()));
  await waitFor(moonBase.transferOwnership(freeClaim.address));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
