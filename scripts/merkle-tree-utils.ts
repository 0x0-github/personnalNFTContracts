import { keccak256, } from "ethers/lib/utils";
import { getWhitelistMerkleTree } from "../utils/whitelist-utils";

async function main() {
    const merkleTree = getWhitelistMerkleTree();
    const address = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4";

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
