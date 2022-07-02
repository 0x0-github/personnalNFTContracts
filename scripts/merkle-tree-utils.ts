import { solidityKeccak256, } from "ethers/lib/utils";
import { getWhitelistMerkleTree } from "../utils/banner-whitelist-utils";

async function main() {
    const merkleTree = getWhitelistMerkleTree();
    const address = "0x92010D29227Ebe9A7625AC398310A7bB3030EcBE";
    const amount = 4;

    console.log("MERKLE ROOT");
    console.log(merkleTree.getHexRoot());
    console.log("PROOF");
    console.log(merkleTree.getHexProof(solidityKeccak256(["address", "uint256"], [address, amount])));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
