const { ethers } = require('hardhat');
const { BigNumber } = require('ethers');

const deployContract = async function (contractName, constructorArgs) {
  let factory;
  try {
    factory = await ethers.getContractFactory(contractName);
  } catch (e) {
    factory = await ethers.getContractFactory(contractName + 'UpgradeableWithInit');
  }
  let contract = await factory.deploy(...(constructorArgs || []));
  await contract.deployed();
  return contract;
};

const getBlockTimestamp = async function () {
  return parseInt((await ethers.provider.getBlock('latest'))['timestamp']);
};

const offsettedIndex = function (startTokenId, arr) {
  // return one item if arr length is 1
  if (arr.length === 1) {
    return BigNumber.from(startTokenId + arr[0]);
  }
  return arr.map((num) => BigNumber.from(startTokenId + num));
};

const mineBlockTimestamp = async function (timestamp) {
  await ethers.provider.send('evm_setNextBlockTimestamp', [timestamp]);
  await ethers.provider.send('evm_mine');
};

const timeTravel = async (seconds) => {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

const hashMessage = (message) => ethers.utils.hashMessage(message);

const mintHash = (addr) => ethers.utils.solidityKeccak256(
    ["address"],
    [addr]
);

const expenseHash = (amount, to, nonce) => ethers.utils.solidityKeccak256(
  ["uint256", "address", "uint256"],
  [amount, to, nonce]
);

const burnHash = (addr, tokenId) => ethers.utils.solidityKeccak256(
  ["address", "uint256"],
  [addr, tokenId]
);

const signHash = async (signer, hash) => {
  return await signer.signMessage(ethers.utils.arrayify(hash));
};

const signHashAndSplitSig = async (signer, hash) => {
  const signature = await signer.signMessage(hash);
  const r = signature.slice(0, 66);
  const s = `0x${signature.slice(66, 130)}`;
  const v = `0x${signature.slice(130, 132)}`;

  return { r, s, v };
};

const recoverSigner = async (hash, sig) => {
  return ethers.utils.recoverAddress(ethers.utils.arrayify(hash), sig);
}

const waitFor = async (txPromise, fnName) => {
  return await txPromise.then(async (tx) => {
    const r = await tx.wait();

    if (fnName) {
      console.log(`Gas used for ${fnName}: ${r.gasUsed}`);
    }

    return r;
  });
}

module.exports = {
  deployContract,
  getBlockTimestamp,
  mineBlockTimestamp,
  offsettedIndex,
  timeTravel,
  signHash,
  signHashAndSplitSig,
  mintHash,
  burnHash,
  expenseHash,
  hashMessage,
  recoverSigner,
  waitFor,
  ZERO_ADDR: "0x0000000000000000000000000000000000000000"
};
