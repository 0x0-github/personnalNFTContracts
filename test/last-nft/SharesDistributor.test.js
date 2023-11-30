const { expect } = require("chai");
const { ethers } = require("hardhat");
const { waitFor } = require("./helpers");
const { BigNumber } = require("ethers");

describe("SharesDistributor", async () => {
  let deployer;
  let rdmAccount;
  let rdmAccount2;
  let sharesContract;
  const beneficiaries = [
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000002",
    "0x0000000000000000000000000000000000000003",
    "0x0000000000000000000000000000000000000004",
    "0x0000000000000000000000000000000000000005",
    "0x0000000000000000000000000000000000000006",
  ];
  const shares = [
    { sales: 20, royalties: 15 },
    { sales: 49, royalties: 65 },
    { sales: 5, royalties: 5 },
    { sales: 5, royalties: 5 },
    { sales: 10, royalties: 5 },
    { sales: 1, royalties: 0 },
    { sales: 10, royalties: 5 },
  ];

  before(async () => {
    [
      deployer,
      rdmAccount,
      rdmAccount2,
    ] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const SharesContract = await ethers.getContractFactory("SharesDistributorMock");

    sharesContract = await SharesContract.deploy();

    await sharesContract.deployed();
  });

  describe("shareETHSalesPart", () => {
    it("Succeeds if called by authorized address and splits shares according to sales shares", async () => {
      const totalSent = "100000000000000000";

      await waitFor(deployer.sendTransaction({
        to: sharesContract.address,
        value: totalSent
      }));

      expect(
        await sharesContract.provider.getBalance(sharesContract.address)
      ).eq(totalSent);

      const prevBalances = [];

      for (let addr of beneficiaries) {
        prevBalances.push(await sharesContract.provider.getBalance(addr));
      }

      await sharesContract.shareETHSalesPart();

      for (let [index, addr] of beneficiaries.entries()) {
        const prevBalance = prevBalances[index];
        const newBalance = await sharesContract.provider.getBalance(addr);
        let withdrawn = newBalance.sub(prevBalance);

        expect(withdrawn.eq(BigNumber.from(totalSent).mul(shares[index].sales).div(100))).true;
      }
    });
    it("Reverts if not called by authorized address", async () => {
      const totalSent = 100000000;

      await waitFor(deployer.sendTransaction({
        to: sharesContract.address,
        value: totalSent
      }));

      await expect(
        sharesContract.connect(rdmAccount).shareETHSalesPart()
      ).to.be.reverted;
      await expect(
        sharesContract.connect(rdmAccount2).shareETHSalesPart()
      ).to.be.reverted;
    });
    it("Reverts if no balance in contract", async () => {
      await expect(
        sharesContract.shareETHSalesPart()
      ).to.be.reverted;
    });
  });

  describe("shareETHRoyaltiesPart", () => {
    it("Succeeds if called by authorized address and splits shares according to royalties shares", async () => {
      const totalSent = "1000000000000000000";

      await waitFor(deployer.sendTransaction({
        to: sharesContract.address,
        value: totalSent
      }));

      expect(
        await sharesContract.provider.getBalance(sharesContract.address)
      ).eq(totalSent);

      const prevBalances = [];

      for (let addr of beneficiaries) {
        prevBalances.push(await sharesContract.provider.getBalance(addr));
      }

      const tx = await sharesContract.shareETHRoyaltiesPart();
      await tx.wait();

      for (let [index, addr] of beneficiaries.entries()) {
        // Deployer paying gas so passing
        const prevBalance = prevBalances[index];
        const newBalance = await sharesContract.provider.getBalance(addr);
        let withdrawn = newBalance.sub(prevBalance);

        expect(withdrawn.eq(BigNumber.from(totalSent).mul(shares[index].royalties).div(100))).true;
      }
    });
    it("Reverts if not called by authorized address", async () => {
      const totalSent = 100000000;

      await waitFor(deployer.sendTransaction({
        to: sharesContract.address,
        value: totalSent
      }));

      await expect(
        sharesContract.connect(rdmAccount).shareETHRoyaltiesPart()
      ).to.be.reverted;
      await expect(
        sharesContract.connect(rdmAccount2).shareETHRoyaltiesPart()
      ).to.be.reverted;
    });
    it("Reverts if no balance in contract", async () => {
      await expect(
        sharesContract.shareETHRoyaltiesPart()
      ).to.be.reverted;
    });
  });
});
