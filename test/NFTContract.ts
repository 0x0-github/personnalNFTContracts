import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { NFTContract } from "../types";
import { MerkleTree } from "merkletreejs";
import { appendManyToWhitelist, appendToWhitelist, getWhitelistMerkleTree } from "../utils/whitelist-utils";
import { BASE_URI, UNREVEAL_URI } from "../utils/constants";
import { waitFor } from "../utils/tx-helper";
import { keccak256 } from "ethers/lib/utils";
import { timeTravel } from "../utils/localhost-evm-time-travel";
import { BigNumber } from "ethers";

describe("NFTContract", async () => {
  const saleTimeout = 1200;
  let deployer: SignerWithAddress;
  let rdmWhitelistedAccount1: SignerWithAddress;
  let rdmWhitelistedAccount2: SignerWithAddress;
  let rdmNotWhitelistedAccount1: SignerWithAddress;
  let rdmNotWhitelistedAccount2: SignerWithAddress;
  let rdmAccount1: SignerWithAddress;
  let rdmAccount2: SignerWithAddress;
  let nftContract: NFTContract;
  let whitelistTree: MerkleTree;

  before(async () => {
    [
      deployer,
      rdmWhitelistedAccount1,
      rdmWhitelistedAccount2,
      rdmNotWhitelistedAccount1,
      rdmNotWhitelistedAccount2,
      rdmAccount1,
      rdmAccount2
    ] = await ethers.getSigners();

    appendManyToWhitelist([
      deployer.address,
      rdmWhitelistedAccount1.address,
      rdmWhitelistedAccount2.address,
    ]);

    whitelistTree = getWhitelistMerkleTree();
  });

  beforeEach(async () => {
    const NFTContract = await ethers.getContractFactory("NFTContract");
    const merkleRoot = whitelistTree.getHexRoot();

    const saleStart = (await ethers.provider.getBlock("latest")).timestamp + saleTimeout;

    nftContract = await NFTContract.deploy(saleStart, merkleRoot) as NFTContract;

    await nftContract.deployed();

    await waitFor(nftContract.setUnrevealedURI(UNREVEAL_URI));
  });

  describe("setMintPaused", () => {
    it("Succeeds if called by contract owner", async () => {
      await waitFor(nftContract.setMintPaused(true));

      expect(await nftContract.mintPaused()).eq(true);

      await waitFor(nftContract.setMintPaused(false));

      expect(await nftContract.mintPaused()).eq(false);
    });
    it("Reverts if not called by contract owner", async () => {
      await expect(
        nftContract.connect(rdmWhitelistedAccount1).setMintPaused(false)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("setSalePrice", () => {
    it("Succeeds if called by contract owner", async () => {
      await waitFor(nftContract.setSalePrice(2));

      expect(await nftContract.salePrice()).eq(2);

      await waitFor(nftContract.setSalePrice(3));

      expect(await nftContract.salePrice()).eq(3);
    });
    it("Reverts if not called by contract owner", async () => {
      await expect(
        nftContract.connect(rdmWhitelistedAccount1).setSalePrice(4)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("setWlPrice", () => {
    it("Succeeds if called by contract owner", async () => {
      await waitFor(nftContract.setWlPrice(5));

      expect(await nftContract.wlPrice()).eq(5);

      await waitFor(nftContract.setWlPrice(6));

      expect(await nftContract.wlPrice()).eq(6);
    });
    it("Reverts if not called by contract owner", async () => {
      await expect(
        nftContract.connect(rdmWhitelistedAccount1).setWlPrice(7)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("setMaxMintTx", () => {
    it("Succeeds if called by contract owner", async () => {
      await waitFor(nftContract.setMaxMintTx(1));

      expect(await nftContract.maxMintTx()).eq(1);

      await waitFor(nftContract.setMaxMintTx(2));

      expect(await nftContract.maxMintTx()).eq(2);
    });
    it("Reverts if not called by contract owner", async () => {
      await expect(
        nftContract.connect(rdmWhitelistedAccount1).setMaxMintTx(3)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("setMerkleRoot", () => {
    it("Succeeds if called by contract owner", async () => {
      const root = "0x0000000000000000000000000000000000000000000000000000000000000001";
      await waitFor(nftContract.setMerkleRoot(root));

      expect(await nftContract.merkleRoot()).eq(root);

      appendToWhitelist(rdmAccount2.address);

      const root2 = getWhitelistMerkleTree().getHexRoot();

      await waitFor(nftContract.setMerkleRoot(root2));

      expect(await nftContract.merkleRoot()).eq(root2);
    });
    it("Reverts if not called by contract owner", async () => {
      appendToWhitelist(rdmAccount1.address);

      const root = getWhitelistMerkleTree().getHexRoot();

      await expect(
        nftContract.connect(rdmWhitelistedAccount1).setMerkleRoot(root)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("setUnrevealedURI", () => {
    it("Succeeds if called by contract owner", async () => {
      await waitFor(nftContract.setUnrevealedURI("unrevealedURI"));

      expect(await nftContract.unrevealedURI()).eq("unrevealedURI");

      await waitFor(nftContract.setUnrevealedURI("annotherUnrevealedURI"));

      expect(await nftContract.unrevealedURI()).eq("annotherUnrevealedURI");
    });
    it("Reverts if not called by contract owner", async () => {
      await expect(
        nftContract.connect(rdmWhitelistedAccount1).reveal("uri")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("reveal", () => {
    it("Succeeds if called by contract owner", async () => {
      await waitFor(nftContract.reveal("uri"));

      expect(await nftContract.baseURI()).eq("uri");

      await waitFor(nftContract.reveal("annotherURI"));

      expect(await nftContract.baseURI()).eq("annotherURI");
    });
    it("Reverts if not called by contract owner", async () => {
      await expect(
        nftContract.connect(rdmWhitelistedAccount1).reveal("uri")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("withdraw", () => {
    it("Succeeds if called by contract owner", async () => {
      const totalSent = 100000000;

      await waitFor(deployer.sendTransaction({
        to: nftContract.address,
        value: totalSent
      }));

      expect(
        await nftContract.provider.getBalance(nftContract.address)
      ).eq(totalSent);

      const withdraw1 = 15000;

      const rdmBalanceBefore = await nftContract.provider.getBalance(rdmAccount1.address);

      await waitFor(nftContract.withdraw(rdmAccount1.address, withdraw1));

      expect(await nftContract.provider.getBalance(rdmAccount1.address)).eq(rdmBalanceBefore.add(withdraw1));
      expect(await nftContract.provider.getBalance(nftContract.address)).eq(totalSent - withdraw1);

      const withdraw2 = 55000;

      const rdmBalanceBefore2 = await nftContract.provider.getBalance(rdmAccount2.address);

      await waitFor(nftContract.withdraw(rdmAccount2.address, withdraw2));

      expect(await nftContract.provider.getBalance(rdmAccount2.address)).eq(rdmBalanceBefore2.add(withdraw2));
      expect(await nftContract.provider.getBalance(nftContract.address)).eq(totalSent - withdraw1 - withdraw2);
    });
    it("Reverts if not called by contract owner", async () => {
      const totalSent = 100000000;

      await waitFor(deployer.sendTransaction({
        to: nftContract.address,
        value: totalSent
      }));

      expect(
        await nftContract.provider.getBalance(nftContract.address)
      ).eq(totalSent);

      await expect(
        nftContract.connect(rdmWhitelistedAccount1).withdraw(deployer.address, 1000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("numberMinted", () => {
    it("Returns the number minted for the given address", async () => {
      await timeTravel(saleTimeout + 1);

      await waitFor(nftContract.setMaxMintTx(10));

      expect(await nftContract.numberMinted(deployer.address)).eq(0);

      const price = await nftContract.wlPrice();

      await waitFor(
        nftContract.saleMint(
          1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price }
        )
      );

      expect(await nftContract.numberMinted(deployer.address)).eq(1);

      expect(await nftContract.numberMinted(rdmWhitelistedAccount1.address)).eq(0);

      await waitFor(
        nftContract.connect(rdmWhitelistedAccount1).saleMint(
          6,
          rdmWhitelistedAccount1.address,
          whitelistTree.getHexProof(keccak256(rdmWhitelistedAccount1.address)),
          { value: price.mul(6) }
        )
      );

      expect(await nftContract.numberMinted(rdmWhitelistedAccount1.address)).eq(6);

      await waitFor(nftContract.burn(1));

      expect(await nftContract.totalSupply())
        .eq((await nftContract.totalMinted()).sub(1));

      expect(await nftContract.numberMinted(deployer.address)).eq(1);

      await waitFor(
        nftContract.saleMint(
          5,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price.mul(5) }
        )
      );

      expect(await nftContract.numberMinted(deployer.address)).eq(6);
    });
  });

  describe("isSale", () => {
    it("Returns false if sale is not started", async () => {
      expect(await nftContract.isSale()).eq(false);
    });
    it("Returns true if sale is started", async () => {
      expect(await nftContract.isSale()).eq(false);

      await timeTravel(saleTimeout + 1);

      expect(await nftContract.isSale()).eq(true);
    });
  });

  describe("totalMinted", () => {
    it("Returns the number minted for the given address", async () => {
      await timeTravel(saleTimeout + 1);

      await waitFor(nftContract.setMaxMintTx(10));

      expect(await nftContract.totalMinted()).eq(0);

      const price = await nftContract.wlPrice();

      await waitFor(
        nftContract.saleMint(
          1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price }
        )
      );

      expect(await nftContract.totalMinted()).eq(1);

      await waitFor(
        nftContract.connect(rdmWhitelistedAccount1).saleMint(
          6,
          rdmWhitelistedAccount1.address,
          whitelistTree.getHexProof(keccak256(rdmWhitelistedAccount1.address)),
          { value: price.mul(6) }
        )
      );

      expect(await nftContract.totalMinted()).eq(7);

      await waitFor(nftContract.burn(1));

      expect(await nftContract.totalMinted()).eq(7);

      await waitFor(
        nftContract.saleMint(
          5,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price.mul(5) }
        )
      );

      expect(await nftContract.totalMinted()).eq(12);
    });
  });

  describe("tokenURI", () => {
    const mintAmount = 3;

    beforeEach(async () => {
      await timeTravel(saleTimeout + 1);

      const price = await nftContract.wlPrice();

      await waitFor(
        nftContract.saleMint(
          mintAmount,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price.mul(mintAmount) }
        )
      );
    });
    it("Returns unrevealed token URI if id exists and not revealed", async () => {
      expect(await nftContract.tokenURI(1)).eq(UNREVEAL_URI);
      expect(await nftContract.tokenURI(2)).eq(UNREVEAL_URI);
      expect(await nftContract.tokenURI(3)).eq(UNREVEAL_URI);
    });
    it("Returns token URI if id exists and is revealed", async () => {
      await waitFor(nftContract.reveal(BASE_URI));

      expect(await nftContract.tokenURI(1)).eq(BASE_URI + "1.json");
      expect(await nftContract.tokenURI(2)).eq(BASE_URI + "2.json");
      expect(await nftContract.tokenURI(3)).eq(BASE_URI + "3.json");
    });
    it("Reverts if id doesn't exist", async () => {
      await expect(
        nftContract.tokenURI(0)
      ).to.be.revertedWith("URIQueryForNonexistentToken");
      await expect(
        nftContract.tokenURI(99999)
      ).to.be.revertedWith("URIQueryForNonexistentToken");
    });
  });

  describe("saleMint", () => {
    it("Succeeds and costs wl price if is sale and address whitelisted and amount <= maxTx and enough ETH sent", async () => {
      await timeTravel(saleTimeout + 1);

      const price = await nftContract.wlPrice();

      const mintAmount1 = 3;
      const mintAmount2 = 2;
      const mintAmount3 = 1;

      const deployerBalanceBefore = await nftContract.provider.getBalance(deployer.address);
      const rdm1BalanceBefore = await nftContract.provider.getBalance(rdmWhitelistedAccount1.address);
      const rdm2BalanceBefore = await nftContract.provider.getBalance(rdmWhitelistedAccount2.address);

      const mintReceipt1 = await waitFor(
        nftContract.saleMint(
          mintAmount1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price.mul(mintAmount1) }
        )
      );
      const mintReceipt2 = await waitFor(nftContract.connect(rdmWhitelistedAccount1).saleMint(
        mintAmount2,
        rdmWhitelistedAccount1.address,
        whitelistTree.getHexProof(keccak256(rdmWhitelistedAccount1.address)),
        { value: price.mul(mintAmount2) }
      ));
      const mintReceipt3 = await waitFor(nftContract.connect(rdmWhitelistedAccount2).saleMint(
        mintAmount3,
        rdmWhitelistedAccount2.address,
        whitelistTree.getHexProof(keccak256(rdmWhitelistedAccount2.address)),
        { value: price.mul(mintAmount3) }
      ));

      const mintGasCost1 = mintReceipt1.gasUsed.mul(mintReceipt1.effectiveGasPrice);
      const mintGasCost2 = mintReceipt2.gasUsed.mul(mintReceipt2.effectiveGasPrice);
      const mintGasCost3 = mintReceipt3.gasUsed.mul(mintReceipt3.effectiveGasPrice);

      expect(
        await nftContract.provider.getBalance(deployer.address)
      ).eq(deployerBalanceBefore.sub(price.mul(mintAmount1)).sub(mintGasCost1));
      expect(
        await nftContract.provider.getBalance(rdmWhitelistedAccount1.address)
      ).eq(rdm1BalanceBefore.sub(price.mul(mintAmount2)).sub(mintGasCost2));
      expect(
        await nftContract.provider.getBalance(rdmWhitelistedAccount2.address)
      ).eq(rdm2BalanceBefore.sub(price.mul(mintAmount3)).sub(mintGasCost3));

      expect(await nftContract.balanceOf(deployer.address)).eq(mintAmount1);
      expect(await nftContract.balanceOf(rdmWhitelistedAccount1.address)).eq(mintAmount2);
      expect(await nftContract.balanceOf(rdmWhitelistedAccount2.address)).eq(mintAmount3);

      expect(await nftContract.ownerOf(1)).eq(deployer.address);
      expect(await nftContract.ownerOf(2)).eq(deployer.address);
      expect(await nftContract.ownerOf(3)).eq(deployer.address);
      expect(await nftContract.ownerOf(4)).eq(rdmWhitelistedAccount1.address);
      expect(await nftContract.ownerOf(5)).eq(rdmWhitelistedAccount1.address);
      expect(await nftContract.ownerOf(6)).eq(rdmWhitelistedAccount2.address);
    });
    it("Succeeds and costs sale price if is sale and address not whitelisted and amount <= maxTx and enough ETH sent", async () => {
      await timeTravel(saleTimeout + 1);

      const price = await nftContract.salePrice();

      const mintAmount1 = 3;
      const mintAmount2 = 2;

      const rdm1BalanceBefore = await nftContract.provider.getBalance(rdmNotWhitelistedAccount1.address);
      const rdm2BalanceBefore = await nftContract.provider.getBalance(rdmNotWhitelistedAccount2.address);

      const mintReceipt1 = await waitFor(nftContract.connect(rdmNotWhitelistedAccount1).saleMint(
        mintAmount1,
        rdmNotWhitelistedAccount1.address,
        whitelistTree.getHexProof(keccak256(rdmNotWhitelistedAccount1.address)),
        { value: price.mul(mintAmount1) }
      ));
      const mintReceipt2 = await waitFor(nftContract.connect(rdmNotWhitelistedAccount2).saleMint(
        mintAmount2,
        rdmNotWhitelistedAccount2.address,
        whitelistTree.getHexProof(keccak256(rdmNotWhitelistedAccount2.address)),
        { value: price.mul(mintAmount2) }
      ));

      const mintGasCost1 = mintReceipt1.gasUsed.mul(mintReceipt1.effectiveGasPrice);
      const mintGasCost2 = mintReceipt2.gasUsed.mul(mintReceipt2.effectiveGasPrice);

      expect(
        await nftContract.provider.getBalance(rdmNotWhitelistedAccount1.address)
      ).eq(rdm1BalanceBefore.sub(price.mul(mintAmount1)).sub(mintGasCost1));
      expect(
        await nftContract.provider.getBalance(rdmNotWhitelistedAccount2.address)
      ).eq(rdm2BalanceBefore.sub(price.mul(mintAmount2)).sub(mintGasCost2));

      expect(await nftContract.balanceOf(rdmNotWhitelistedAccount1.address)).eq(mintAmount1);
      expect(await nftContract.balanceOf(rdmNotWhitelistedAccount2.address)).eq(mintAmount2);

      expect(await nftContract.ownerOf(1)).eq(rdmNotWhitelistedAccount1.address);
      expect(await nftContract.ownerOf(2)).eq(rdmNotWhitelistedAccount1.address);
      expect(await nftContract.ownerOf(3)).eq(rdmNotWhitelistedAccount1.address);
      expect(await nftContract.ownerOf(4)).eq(rdmNotWhitelistedAccount2.address);
      expect(await nftContract.ownerOf(5)).eq(rdmNotWhitelistedAccount2.address);
    });
    it("Reverts if not sale", async () => {
      const price = await nftContract.wlPrice();

      await expect(
        nftContract.saleMint(
          1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price }
        )
      ).to.be.revertedWith("SaleNotStarted");

      await timeTravel(saleTimeout - 500);

      await expect(
        nftContract.saleMint(
          1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price }
        )
      ).to.be.revertedWith("SaleNotStarted");
    });
    it("Reverts if mint is paused", async () => {
      await timeTravel(saleTimeout + 1);

      const price = await nftContract.wlPrice();

      await waitFor(nftContract.setMintPaused(true));

      await expect(
        nftContract.saleMint(
          1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price }
        )
      ).to.be.revertedWith("MintPaused");
    });
    it("Reverts if amount > maxMintTx", async () => {
      await timeTravel(saleTimeout + 1);

      const price = await nftContract.wlPrice();
      const maxMintTx = await nftContract.maxMintTx();

      await expect(
        nftContract.saleMint(
          maxMintTx.add(1),
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price.mul(maxMintTx.add(1)) }
        )
      ).to.be.revertedWith("AmountGtMax");

      await expect(
        nftContract.saleMint(
          maxMintTx.add(1000),
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price.mul(maxMintTx.add(1000)) }
        )
      ).to.be.revertedWith("AmountGtMax");

      await waitFor(nftContract.setSalePrice(0));
      await waitFor(nftContract.setWlPrice(0));

      const maxUint = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

      await expect(
        nftContract.saleMint(
          maxUint,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address))
        )
      ).to.be.revertedWith("AmountGtMax");

      await expect(
        nftContract.saleMint(
          maxUint.add(1),
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address))
        )
      ).to.be.reverted;
    });
    it("Reverts if sold out", async () => {
      await timeTravel(saleTimeout + 1);

      const price = await nftContract.wlPrice();
      const maxSupply = (await nftContract.MINT_SUPPLY()).toNumber();

      await waitFor(nftContract.setMaxMintTx(maxSupply + 1));

      await expect(
        nftContract.saleMint(
          maxSupply + 1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price.mul(maxSupply + 1) }
        )
      ).to.be.revertedWith("SoldOut");

      for (let i = 0; i < maxSupply; i++) {
        await waitFor(
          nftContract.saleMint(
            1,
            deployer.address,
            whitelistTree.getHexProof(keccak256(deployer.address)),
            { value: price }
          )
        );
      }

      await expect(
        nftContract.saleMint(
          1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: price }
        )
      ).to.be.revertedWith("SoldOut");

      const maxUint = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

      await waitFor(nftContract.setMaxMintTx(maxUint));
      await waitFor(nftContract.setSalePrice(0));
      await waitFor(nftContract.setWlPrice(0));

      await expect(
        nftContract.saleMint(
          maxUint,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address))
        )
      ).to.be.reverted;

      await expect(
        nftContract.saleMint(
          maxUint.add(1),
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address))
        )
      ).to.be.reverted;
    });
    it("Reverts if incorrect ETH sent", async () => {
      await timeTravel(saleTimeout + 1);

      const wlPrice = await nftContract.wlPrice();
      const salePrice = await nftContract.salePrice();

      await expect(
        nftContract.saleMint(
          1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: 0 }
        )
      ).to.be.revertedWith("IncorrectETHValue");

      await expect(
        nftContract.saleMint(
          1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: salePrice }
        )
      ).to.be.revertedWith("IncorrectETHValue");

      await expect(
        nftContract.saleMint(
          1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: wlPrice.sub(1) }
        )
      ).to.be.revertedWith("IncorrectETHValue");

      await expect(
        nftContract.saleMint(
          1,
          deployer.address,
          whitelistTree.getHexProof(keccak256(deployer.address)),
          { value: wlPrice.add(1) }
        )
      ).to.be.revertedWith("IncorrectETHValue");

      await expect(
        nftContract.connect(rdmNotWhitelistedAccount1).saleMint(
          1,
          rdmNotWhitelistedAccount1.address,
          whitelistTree.getHexProof(keccak256(rdmNotWhitelistedAccount1.address)),
          { value: 0 }
        )
      ).to.be.revertedWith("IncorrectETHValue");

      await expect(
        nftContract.connect(rdmNotWhitelistedAccount1).saleMint(
          1,
          rdmNotWhitelistedAccount1.address,
          whitelistTree.getHexProof(keccak256(rdmNotWhitelistedAccount1.address)),
          { value: wlPrice }
        )
      ).to.be.revertedWith("IncorrectETHValue");

      await expect(
        nftContract.connect(rdmNotWhitelistedAccount1).saleMint(
          1,
          rdmNotWhitelistedAccount1.address,
          whitelistTree.getHexProof(keccak256(rdmNotWhitelistedAccount1.address)),
          { value: salePrice.sub(1) }
        )
      ).to.be.revertedWith("IncorrectETHValue");

      await expect(
        nftContract.connect(rdmNotWhitelistedAccount1).saleMint(
          1,
          rdmNotWhitelistedAccount1.address,
          whitelistTree.getHexProof(keccak256(rdmNotWhitelistedAccount1.address)),
          { value: salePrice.add(1) }
        )
      ).to.be.revertedWith("IncorrectETHValue");
    });
  });

  /*describe("fullProcess", () => {
    it("Full mint process", async () => {
      await timeTravel(presaleTimeout);

      const presaleMints = 3;
      const teamSupply = (await nftContract.TEAM_SUPPLY()).toNumber();

      await waitFor(nftContract.presaleMint(
        whitelistTree.getHexProof(keccak256(deployer.address)),
        { value: await nftContract.SALE_PRICE() }
      ));
      await expect(nftContract.presaleMint(
        whitelistTree.getHexProof(keccak256(deployer.address)),
        { value: await nftContract.SALE_PRICE() }
      )).to.be.reverted;
      await expect(nftContract.connect(rdmWhitelistedAccount1).presaleMint(
        whitelistTree.getHexProof(keccak256(rdmWhitelistedAccount1.address)),
        { value: (await nftContract.SALE_PRICE()).toNumber() - 1 }
      )).to.be.reverted;
      await waitFor(nftContract.connect(rdmWhitelistedAccount1).presaleMint(
        whitelistTree.getHexProof(keccak256(rdmWhitelistedAccount1.address)),
        { value: await nftContract.SALE_PRICE() }
      ));
      await waitFor(nftContract.connect(rdmWhitelistedAccount2).presaleMint(
        whitelistTree.getHexProof(keccak256(rdmWhitelistedAccount2.address)),
        { value: await nftContract.SALE_PRICE() }
      ));

      expect(await nftContract.totalSupply()).eq(presaleMints);

      expect(await nftContract.ownerOf(1)).eq(deployer.address);
      expect(await nftContract.tokenURI(1)).eq(UNREVEAL_URI);
      expect(await nftContract.ownerOf(2)).eq(rdmWhitelistedAccount1.address);
      expect(await nftContract.tokenURI(2)).eq(UNREVEAL_URI);
      expect(await nftContract.ownerOf(3)).eq(rdmWhitelistedAccount2.address);
      expect(await nftContract.tokenURI(3)).eq(UNREVEAL_URI);

      await waitFor(nftContract.teamMint(teamSupply, deployer.address));

      expect(await nftContract.totalSupply()).eq(presaleMints + teamSupply);

      for (let i = 1; i <= teamSupply; i++) {
        expect(await nftContract.ownerOf(presaleMints + i)).eq(deployer.address);
        expect(await nftContract.tokenURI(presaleMints + i)).eq(UNREVEAL_URI);
      }

      await timeTravel(presaleDuration);

      await expect(nftContract.saleMint(
        maxSaleTxMints + 1,
        { value: (await nftContract.SALE_PRICE()).mul(maxSaleTxMints + 1) }
      )).to.be.reverted;

      await waitFor(nftContract.saleMint(
        1,
        { value: (await nftContract.SALE_PRICE()).mul(1) }
      ));

      await expect(nftContract.saleMint(
        2,
        { value: (await nftContract.SALE_PRICE()).mul(2) }
      )).to.be.reverted;

      await waitFor(nftContract.saleMint(
        1,
        { value: (await nftContract.SALE_PRICE()).mul(1) }
      ));

      expect(await nftContract.ownerOf(presaleMints + teamSupply + 1)).eq(deployer.address);
      expect(await nftContract.tokenURI(presaleMints + teamSupply + 1)).eq(UNREVEAL_URI);
      expect(await nftContract.ownerOf(presaleMints + teamSupply + 2)).eq(deployer.address);
      expect(await nftContract.tokenURI(presaleMints + teamSupply + 2)).eq(UNREVEAL_URI);

      expect(await nftContract.totalSupply()).eq(presaleMints + teamSupply + 2);
      expect(await nftContract.totalSupply()).eq(await nftContract.MINT_SUPPLY());

      const maxSpecial = (await nftContract.SPECIAL_SUPPLY()).toNumber();

      await waitFor(nftContract.specialMint(maxSpecial, deployer.address));

      const contractMaxSupply = (await nftContract.MINT_SUPPLY()).add(await nftContract.TEAM_SUPPLY()).toNumber();

      expect(await nftContract.totalSupply()).eq(presaleMints + teamSupply + 2 + maxSpecial);
      expect(await nftContract.totalSupply()).eq(contractMaxSupply);

      const mintSupply = (await nftContract.MINT_SUPPLY()).toNumber();

      for (let i = 1; i <= maxSpecial; i++) {
        expect(await nftContract.ownerOf(mintSupply + i)).eq(deployer.address);
      }

      const revealURI = "ipfs://reveal/";
      const specialURI = "ipfs://special/";

      await waitFor(nftContract.reveal(revealURI));
      await waitFor(nftContract.revealSpecial(specialURI));

      for (let i = 1; i <= mintSupply; i++) {
        expect(await nftContract.tokenURI(i)).eq(revealURI + i + ".json");
      }

      for (let i = mintSupply + 1; i <= mintSupply + maxSpecial; i++) {
        expect(await nftContract.tokenURI(i)).eq(specialURI + i + ".json");
      }
    });
  });*/
});
