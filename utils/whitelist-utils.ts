import fs from "fs";
import { WHITELIST_FILE_PATH } from "./constants";
import { keccak256 } from "ethers/lib/utils";
import { MerkleTree } from "merkletreejs";

export const loadWhitelist = (): [string] => {
  const content = fs.readFileSync(WHITELIST_FILE_PATH, "utf8");
  let json;

  try {
    json = JSON.parse(content);
  } catch {
    json = [];
  }

  return json;
}

export const appendToWhitelist = (address: string): void => {
  const whitelist = loadWhitelist();

  if (whitelist.filter(elt => elt === address).length > 0)
    return;

  whitelist.push(address);

  fs.writeFileSync(WHITELIST_FILE_PATH, JSON.stringify(whitelist), "utf8");
}

export const appendManyToWhitelist = (addresses: string[]): void => {
  const whitelist = loadWhitelist();

  for (const address of addresses) {
    if (whitelist.filter(elt => elt === address).length === 0)
      whitelist.push(address);
  }

  fs.writeFileSync(WHITELIST_FILE_PATH, JSON.stringify(whitelist), "utf8");
}

export const removeFromWhitelist = (address: string): void => {
  const whitelist = loadWhitelist();
  const updated = whitelist.filter(elt => elt !== address);

  fs.writeFileSync(WHITELIST_FILE_PATH, JSON.stringify(updated), "utf8");
}

export const getMerkleTree = (jsonData: [string]): MerkleTree => {
  const leaves = jsonData.map(elt => keccak256(elt));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });

  return tree;
}

export const getWhitelistMerkleTree = (): MerkleTree => {
  const whitelist = loadWhitelist();

  return getMerkleTree(whitelist);
}
