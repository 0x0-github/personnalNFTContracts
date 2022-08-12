// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { randomInt } from "crypto";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NFTContract } from "../types/NFTContract";
import { waitFor } from "../utils/tx-helper";
import { getMerkleTree, getWhitelistMerkleTree } from "../utils/whitelist-utils";

type MintData = {
  signer: SignerWithAddress,
  address: string,
  mintAmounts: number,
  mintCalls: number,
  mintCostEth: BigNumber,
  mintCostFees: BigNumber,
};

const dispatchEthToAccounts = async (sender: SignerWithAddress, datas: MintData[]) => {
  for (let data of datas) {
    const value = data.mintCostEth.add(data.mintCostFees);

    const receipt = await waitFor(sender.sendTransaction({
      to: data.address,
      value
    }));

    if (receipt.status === 1) {
      console.log(`Successfully transferred ${ethers.utils.formatEther(value)} to ${data.address}`);
    } else {
      console.log(`Failed sending ${ethers.utils.formatEther(value)} to ${data.address}`);
    }
  }
};

const mintFromAccounts = async (contract: NFTContract, datas: MintData[]) {
  // Arbitrary set to 5 sec
  const minIntervalMs = 5000;
  // Arbitrary set to 7 min
  const maxIntervalMs = 420000;

  
}

const main = async () => {
  const TOTAL_MINTS = 1000;
  const MINT_GAS_LIMIT = 90000;
  const MINT_SUPP_GAS_LIMIT = 5000;
  const TRANSFER_GAS_LIMIT = 21000;
  const CONTRACT_ADDR = "0xE405168Ce501F526045d33A1f056E145275C54A7";

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const bots = signers.filter(elt => elt != deployer);

  console.log("Running on chain:", await deployer.getChainId());
  console.log("---NFT minting script---");
  console.log("Total bots:", bots.length);

  const mintQuantities: number[] = [];
  let mintsData: any[] = [];
  // Defined arbitrary at 1.4% TOTAL
  const minMint = TOTAL_MINTS / 10 * 14 / 100;
  // Defined arbitrary at 12.6% TOTAL
  const maxMint = TOTAL_MINTS / 10 * 126 / 100

  const finalBots = [];

  bots.forEach((elt, index) => {
    let rdm = (randomInt(maxMint - minMint) + minMint);
    const currentMints = mintQuantities.reduce(function(acc, val) { return acc + val; }, 0);

    rdm = (rdm + currentMints <= TOTAL_MINTS && index !== bots.length - 1) ?  rdm : TOTAL_MINTS - currentMints;

    mintQuantities.push(rdm);

    if (rdm !== 0) {
      mintsData.push({signer: elt, address: elt.address, mintAmounts: rdm});
      finalBots.push(elt);
    }
  })

  console.log("Total mint amounts:", mintQuantities.reduce((acc, val) => acc + val, 0));
  console.log("Total minters required:", finalBots.length);

  //const nftContract = await ethers.getContractAt("NFTContract", CONTRACT_ADDR, deployer) as NFTContract;
  const NFTContract = await ethers.getContractFactory("NFTContract");
  const nftContract = await NFTContract.deploy(0, getWhitelistMerkleTree().getHexRoot()) as NFTContract;
  
  await nftContract.deployed();
  
  console.log("NFTContract deployed to:", nftContract.address);

  const deployerAmount = await nftContract.provider.getBalance(deployer.address);

  const currentGasPrice = await ethers.getDefaultProvider().getGasPrice();

  console.log("Current gas price is", ethers.utils.formatUnits(currentGasPrice, 'gwei'), "GWEI");

  const transfersCost = currentGasPrice.mul(finalBots.length * TRANSFER_GAS_LIMIT);

  console.log("Total ETH transfer fees for bots:", ethers.utils.formatEther(transfersCost));

  const maxMintTx = (await nftContract.maxMintTx()).toNumber();
  // TODO: Uncomment below for main run => formatting to human readable
  //const mintCost = await nftContract.wlPrice();
  const mintCost = await nftContract.salePrice();

  mintsData = mintsData.map(elt => {
    const fullMintCallExcess = elt.mintAmounts % maxMintTx;
    const fullMintCalls = Math.floor(elt.mintAmounts / maxMintTx);
    const mintCalls = fullMintCalls + ((fullMintCallExcess != 0) ? 1 : 0);
    const mintCostFees = BigNumber.from(fullMintCalls).mul((MINT_GAS_LIMIT + MINT_SUPP_GAS_LIMIT * 2) * currentGasPrice.toNumber()).add((fullMintCallExcess !== 0) ? (MINT_GAS_LIMIT + MINT_SUPP_GAS_LIMIT * fullMintCallExcess - 1) : 0);
    const mintCostEth = mintCost.mul(elt.mintAmounts);

    return {
      ...elt,
      mintCalls,
      mintCostEth: mintCostEth,
      mintCostFees: mintCostFees,
    }
  });

  console.log("Mint addresses and associated data:");
  console.log(mintsData.map(elt => {
    return {
      ...elt,
      signer: null, 
    };
  }));

  const totalCostsEth = mintsData.map(elt => elt.mintCostEth.add(elt.mintCostFees));
  let totalEthCost = BigNumber.from(0);
  
  totalCostsEth.forEach(elt => totalEthCost = totalEthCost.add(elt));

  console.log("Total ETH cost:", ethers.utils.formatEther(totalEthCost));

  // TODO: Add some extra % ? On the whole process ?
  if (totalEthCost.gt(deployerAmount)) {
    throw Error("Not enough ETH on the main account");
  }

  await dispatchEthToAccounts(deployer, mintsData);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
