import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TestWithdrawFairly } from "../types";
import { waitFor } from "../utils/tx-helper";
import { BigNumber } from "ethers";

describe("WithdrawFairly", async () => {
  let deployer: SignerWithAddress;
  let rdmAccount: SignerWithAddress;
  let rdmAccount2: SignerWithAddress;
  let withdrawContract: TestWithdrawFairly;
  const benefiriciaries = [
    "0x92010D29227Ebe9A7625AC398310A7bB3030EcBE",
    "0x0000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000002",
    "0x0000000000000000000000000000000000000003",
    "0x0000000000000000000000000000000000000004",
  ];
  const shares = [
    { sales: 500, royalties: 450 },
    { sales: 200, royalties: 95 },
    { sales: 100, royalties: 155 },
    { sales: 45, royalties: 100 },
    { sales: 155, royalties: 200 },
  ];

  before(async () => {
    [
      deployer,
      rdmAccount,
      rdmAccount2,
    ] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const WithdrawContract = await ethers.getContractFactory("TestWithdrawFairly");

    withdrawContract = await WithdrawContract.deploy() as TestWithdrawFairly;

    await withdrawContract.deployed();
  });

  describe("shareSalesPart", () => {
    it("Succeeds if called by authorized address and splits shares according to sales shares", async () => {
      const totalSent = 100000000;

      await waitFor(deployer.sendTransaction({
        to: withdrawContract.address,
        value: totalSent
      }));

      expect(
        await withdrawContract.provider.getBalance(withdrawContract.address)
      ).eq(totalSent);
      
      const prevBalances = [];

      for (let addr of benefiriciaries) {
        prevBalances.push(await withdrawContract.provider.getBalance(addr));
      }

      await waitFor(withdrawContract.shareSalesPart());

      for (let [index, addr] of benefiriciaries.entries()) {
        // Deployer paying gas so passing
        if (index === 0) continue;

        const prevBalance = prevBalances[index];
        const newBalance = await withdrawContract.provider.getBalance(addr);
        const withdrawn = newBalance.sub(prevBalance);

        expect(withdrawn.eq(BigNumber.from(totalSent).mul(shares[index].sales).div(1000))).true;
      }
    });
    it("Reverts if not called by authorized address", async () => {
      const totalSent = 100000000;

      await waitFor(deployer.sendTransaction({
        to: withdrawContract.address,
        value: totalSent
      }));

      await expect(
        withdrawContract.connect(rdmAccount).shareSalesPart()
      ).to.be.reverted;
      await expect(
        withdrawContract.connect(rdmAccount2).shareSalesPart()
      ).to.be.reverted;
    });
    it("Reverts if no balance in contract", async () => {
      await expect(
        withdrawContract.shareSalesPart()
      ).to.be.reverted;
    });
  });

  describe("shareRoyaltiesPart", () => {
    it("Succeeds if called by authorized address and splits shares according to rolaties shares", async () => {
      const totalSent = 100000000;

      await waitFor(deployer.sendTransaction({
        to: withdrawContract.address,
        value: totalSent
      }));

      expect(
        await withdrawContract.provider.getBalance(withdrawContract.address)
      ).eq(totalSent);
      
      const prevBalances = [];

      for (let addr of benefiriciaries) {
        prevBalances.push(await withdrawContract.provider.getBalance(addr));
      }

      await waitFor(withdrawContract.shareRoyaltiesPart());

      for (let [index, addr] of benefiriciaries.entries()) {
        // Deployer paying gas so passing
        if (index === 0) continue;

        const prevBalance = prevBalances[index];
        const newBalance = await withdrawContract.provider.getBalance(addr);
        const withdrawn = newBalance.sub(prevBalance);

        expect(withdrawn.eq(BigNumber.from(totalSent).mul(shares[index].royalties).div(1000))).true;
      }
    });
    it("Reverts if not called by authorized address", async () => {
      const totalSent = 100000000;

      await waitFor(deployer.sendTransaction({
        to: withdrawContract.address,
        value: totalSent
      }));

      await expect(
        withdrawContract.connect(rdmAccount).shareRoyaltiesPart()
      ).to.be.reverted;
      await expect(
        withdrawContract.connect(rdmAccount2).shareRoyaltiesPart()
      ).to.be.reverted;
    });
    it("Reverts if no balance in contract", async () => {
      await expect(
        withdrawContract.shareRoyaltiesPart()
      ).to.be.reverted;
    });
  });
});
