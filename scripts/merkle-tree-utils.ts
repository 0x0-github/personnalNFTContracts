import { keccak256, } from "ethers/lib/utils";
import { getWhitelistMerkleTree } from "../utils/whitelist-utils";

async function main() {
    const merkleTree = getWhitelistMerkleTree();
    const address = "0xcF176AE921BF3A4A4C7CD8010Fc52457A128DE22";

    console.log("MERKLE ROOT");
    console.log(merkleTree.getHexRoot());
    console.log("PROOF");
    console.log(merkleTree.getHexProof(keccak256(address)));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
