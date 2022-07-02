import fs from "fs";
import { BANNER_WHITELIST_FILE_PATH } from "./constants";
import { keccak256, solidityKeccak256 } from "ethers/lib/utils";
import { MerkleTree } from "merkletreejs";

export const loadWhitelist = (): {address: string, amount: number}[] => {
  const content = fs.readFileSync(BANNER_WHITELIST_FILE_PATH, "utf8");
  let json;

  try {
    json = JSON.parse(content);
  } catch {
    json = [];
  }

  return json;
}

export const appendToWhitelist = (address: string, amount: number): void => {
  const whitelist = loadWhitelist();

  if (whitelist.filter(elt => elt.address === address).length > 0)
    return;

  whitelist.push({address, amount});

  fs.writeFileSync(BANNER_WHITELIST_FILE_PATH, JSON.stringify(whitelist), "utf8");
}

export const appendManyToWhitelist = (items: {address: string, amount: number}[]): void => {
  const whitelist = loadWhitelist();

  for (const itm of items) {
    if (whitelist.filter(elt => elt.address === itm.address))
      whitelist.push(itm);
  }

  fs.writeFileSync(BANNER_WHITELIST_FILE_PATH, JSON.stringify(whitelist), "utf8");
}

export const removeFromWhitelist = (address: string): void => {
  const whitelist = loadWhitelist();
  const updated = whitelist.filter(elt => elt.address !== address);

  fs.writeFileSync(BANNER_WHITELIST_FILE_PATH, JSON.stringify(updated), "utf8");
}

export const getMerkleTree = (jsonData: {address: string, amount: number}[]): MerkleTree => {
  const leaves = jsonData.map(elt => solidityKeccak256(["address", "uint256"], [elt.address, elt.amount]));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });

  return tree;
}

export const getWhitelistMerkleTree = (): MerkleTree => {
  const whitelist = loadWhitelist();

  return getMerkleTree(whitelist);
}

export const getMerkleProof = (merkleTree: MerkleTree, address: string, amount: number) => {
  return merkleTree.getHexProof(solidityKeccak256(["address", "uint256"], [address, amount]));
}
