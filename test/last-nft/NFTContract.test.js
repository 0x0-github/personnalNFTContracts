const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require('ethers');
const { timeTravel, waitFor, mintHash, signHash } = require("./helpers");

const BASE_URI = "ipfs://yyyyyyy.xxx/";

describe("NFTContract tests", async () => {
  const salePrice = 1000;
  const maxSupply = 100;
  const presaleTimeout = 36000;
  const presaleDuration = 7200;
  const maxMintsPerTx = 20;
  const maxMintsPresale = 9;
  const mintSigs = [];
  let deployer;
  let rdmWhitelistedAccount1;
  let rdmWhitelistedAccount2;
  let rdmNotWhitelistedAccount1;
  let rdmNotWhitelistedAccount2;
  let nftContract;
  let authority;
  let conf;
  let presaleStart;
  let presaleEnd;

  before(async () => {
    [
      deployer,
      rdmWhitelistedAccount1,
      rdmWhitelistedAccount2,
      rdmNotWhitelistedAccount1,
      rdmNotWhitelistedAccount2,
    ] = await ethers.getSigners();

    authority = new ethers.Wallet(process.env.MINT_AUTHORITY_KEY);

    for (const e of [deployer, rdmWhitelistedAccount1, rdmWhitelistedAccount2]) {
      mintSigs.push(await signHash(authority, mintHash(e.address)));
    }
  });

  beforeEach(async () => {
    const NFTContract = await ethers.getContractFactory("NFTContractMock");

    nftContract = await NFTContract.deploy();

    await nftContract.deployed();

    presaleStart = (await ethers.provider.getBlock("latest")).timestamp + presaleTimeout;
    presaleEnd = presaleStart + presaleDuration;

    await waitFor(nftContract.setConf(
      [
        presaleStart,
        presaleEnd,
        salePrice,
        maxMintsPerTx,
        maxMintsPresale,
        false
      ]
    ));
    await waitFor(nftContract.setBaseURI(BASE_URI));

    conf = await nftContract.conf();
  });

  describe("NFTContract", () => {
    describe("setConf", () => {
      it("Succeeds if called by contract owner", async () => {
        await waitFor(nftContract.setConf(
          [
            conf.presaleStart.add(60),
            conf.presaleEnd.add(60),
            BigNumber.from(10000000),
            BigNumber.from(100),
            BigNumber.from(50),
            false
          ]
        ));

        await waitFor(nftContract.setConf(
          [
            conf.presaleStart.add(60),
            conf.presaleEnd.add(60),
            10000000,
            100,
            50,
            true
          ]
        ));

        await waitFor(nftContract.setConf(
          [
            conf.presaleStart.add(60),
            conf.presaleEnd.add(60),
            10000000,
            100,
            50,
            false
          ]
        ));
      });
      it("Reverts if not called by contract owner", async () => {
        await expect(
          nftContract.connect(rdmWhitelistedAccount1).setConf(
            [
              conf.presaleStart.add(60),
              conf.presaleEnd.add(60),
              10000000,
              100,
              50,
              false,
              false,
            ]
          )
        ).revertedWithCustomError(nftContract, "Unauthorized");
      });
    });

    describe("setBaseURI", () => {
      it("Succeeds if called by contract owner and URI not frozen", async () => {
        await waitFor(nftContract.setBaseURI("uri"));

        expect(await nftContract.baseURI()).eq("uri");

        await waitFor(nftContract.setBaseURI("other-uri"));

        expect(await nftContract.baseURI()).eq("other-uri");
      });
      it("Reverts if not called by contract owner", async () => {
        await expect(
          nftContract.connect(rdmWhitelistedAccount1).setBaseURI("uri")
        ).revertedWithCustomError(nftContract, "Unauthorized");
      });
      it("Reverts if URI already frozen", async () => {
        await waitFor(nftContract.freezeURI());

        await expect(
          nftContract.setBaseURI("uri")
        ).revertedWithCustomError(nftContract, "CannotUpdateFrozenURI");
      });
    });

    describe("freezeURI", () => {
        it("Succeeds if called by owner and uri not frozen", async () => {
            await waitFor(nftContract.freezeURI());

            expect(await nftContract.frozenURI()).eq(true);
        });
        it("Does nothing if URI already frozen", async () => {
            await waitFor(nftContract.freezeURI());

            expect(await nftContract.frozenURI()).eq(true);

            await waitFor(nftContract.freezeURI());
        });
        it("Reverts if not called by contract owner", async () => {
            await expect(
                nftContract.connect(rdmWhitelistedAccount1).freezeURI()
            ).revertedWithCustomError(nftContract, "Unauthorized");
        });
    });

    describe("ownerMint", () => {
      it("Succeeds if called by owner and collection not sold out", async () => {
        const mintAmount = 5;

        await waitFor(nftContract.ownerMint(mintAmount, rdmWhitelistedAccount1.address));

        for (let i = 1; i <= mintAmount; i++) {
          expect(await nftContract.ownerOf(i)).eq(rdmWhitelistedAccount1.address);
        }
      });
      it("Fails if not called by owner", async () => {
        await expect(
          nftContract.connect(rdmWhitelistedAccount1).ownerMint(
            1,
            rdmWhitelistedAccount1.address
          )
        ).to.be.revertedWithCustomError(nftContract, "Unauthorized");
      });
      it("Fails if collection sold out", async () => {
        await expect(
          nftContract.ownerMint(
            maxSupply + 1,
            rdmWhitelistedAccount1.address
          )
        ).revertedWithCustomError(nftContract, "CollectionSoldOut");

        await waitFor(nftContract.ownerMint(maxSupply, rdmWhitelistedAccount1.address));

        await expect(
          nftContract.ownerMint(
            1,
            rdmWhitelistedAccount1.address
          )
        ).revertedWithCustomError(nftContract, "CollectionSoldOut");
      });
    });

    describe("presaleMint", () => {
      it("Succeeds if is presale and address whitelisted and not minted max presale and enough ETH sent", async () => {
        await timeTravel(presaleTimeout);
        await waitFor(nftContract.presaleMint(
          1,
          mintSigs[0],
          { value: salePrice }
        ));
        await waitFor(nftContract.connect(rdmWhitelistedAccount1).presaleMint(
          4,
          mintSigs[1],
          { value: salePrice * 4 }
        ));
        await waitFor(nftContract.connect(rdmWhitelistedAccount2).presaleMint(
          6,
          mintSigs[2],
          { value: salePrice * 6 }
        ));

        expect(await nftContract.ownerOf(1)).eq(deployer.address);
        expect(await nftContract.ownerOf(2)).eq(rdmWhitelistedAccount1.address);
        expect(await nftContract.ownerOf(3)).eq(rdmWhitelistedAccount1.address);
        expect(await nftContract.ownerOf(4)).eq(rdmWhitelistedAccount1.address);
        expect(await nftContract.ownerOf(5)).eq(rdmWhitelistedAccount1.address);
        expect(await nftContract.ownerOf(6)).eq(rdmWhitelistedAccount2.address);
        expect(await nftContract.ownerOf(7)).eq(rdmWhitelistedAccount2.address);
        expect(await nftContract.ownerOf(9)).eq(rdmWhitelistedAccount2.address);
        expect(await nftContract.ownerOf(9)).eq(rdmWhitelistedAccount2.address);
        expect(await nftContract.ownerOf(10)).eq(rdmWhitelistedAccount2.address);
        expect(await nftContract.ownerOf(11)).eq(rdmWhitelistedAccount2.address);
      });
      it("Reverts if mint paused", async () => {
        await waitFor(nftContract.setConf(
          [
            presaleStart,
            presaleEnd,
            salePrice,
            maxMintsPerTx,
            maxMintsPresale,
            true
          ]
        ));

        await timeTravel(presaleTimeout);

        await expect(
          nftContract.presaleMint(
            1,
            mintSigs[0],
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "MintPaused");
      });
      it("Reverts if not presale", async () => {
        await expect(
          nftContract.presaleMint(
            1,
            mintSigs[0],
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "NotPresale");

        await timeTravel(presaleTimeout + presaleDuration);

        await expect(
          nftContract.presaleMint(
            1,
            mintSigs[0],
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "NotPresale");
      });
      it("Reverts if address not whitelisted", async () => {
        await timeTravel(presaleTimeout);

        await expect(
          nftContract.connect(rdmNotWhitelistedAccount1).presaleMint(
            1,
            mintSigs[0],
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "NotWhitelisted");
        await expect(
          nftContract.connect(rdmNotWhitelistedAccount1).presaleMint(
            1,
            signHash(rdmNotWhitelistedAccount1, mintHash(rdmNotWhitelistedAccount1.address)),
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "NotWhitelisted");
        await expect(
          nftContract.connect(rdmNotWhitelistedAccount2).presaleMint(
            1,
            mintSigs[0],
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "NotWhitelisted");
      });
      it("Reverts if caller address does not match signature", async () => {
        await timeTravel(presaleTimeout);

        await expect(
          nftContract.presaleMint(
            1,
            mintSigs[1],
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "NotWhitelisted");
        await expect(
          nftContract.connect(rdmWhitelistedAccount1).presaleMint(
            1,
            mintSigs[0],
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "NotWhitelisted");
        await expect(
          nftContract.connect(rdmNotWhitelistedAccount1).presaleMint(
            1,
            mintSigs[0],
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "NotWhitelisted");
      });
      it("Reverts if already minted max presale", async () => {
        await timeTravel(presaleTimeout);

        await nftContract.presaleMint(
          maxMintsPresale,
          mintSigs[0],
          { value: salePrice * maxMintsPresale }
        );

        await expect(
          nftContract.presaleMint(
            1,
            mintSigs[0],
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "MaxPresaleMints");
      });
      it("Reverts if not enough ETH sent", async () => {
        await timeTravel(presaleTimeout);

        await expect(
          nftContract.presaleMint(
            1,
            mintSigs[0],
            { value: 0 }
          )
        ).revertedWithCustomError(nftContract, "IncorrectETHValue");

        await expect(
          nftContract.presaleMint(
            1,
            mintSigs[0],
            { value: salePrice - 1 }
          )
        ).revertedWithCustomError(nftContract, "IncorrectETHValue");
      });
    });

    // Continue below
    describe("saleMint", () => {
      it("Succeeds if is sale and is not sold out and enough ETH sent and amount < max / tx", async () => {
        await timeTravel(presaleTimeout + presaleDuration);
        await waitFor(nftContract.saleMint(
          1,
          { value: salePrice }
        ));
        await waitFor(nftContract.connect(rdmWhitelistedAccount1).saleMint(
          7,
          { value: salePrice * 7 }
        ));
        await waitFor(nftContract.connect(rdmNotWhitelistedAccount1).saleMint(
          maxMintsPerTx,
          { value: salePrice * maxMintsPerTx }
        ));

        expect(await nftContract.balanceOf(deployer.address)).eq(1);
        expect(await nftContract.balanceOf(rdmWhitelistedAccount1.address)).eq(7);
        expect(await nftContract.balanceOf(rdmNotWhitelistedAccount1.address)).eq(maxMintsPerTx);
      });
      it("Reverts if not sale", async () => {
        await expect(
          nftContract.saleMint(
            1,
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "NotSale");

        await timeTravel(presaleTimeout);

        await expect(
          nftContract.saleMint(
            1,
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "NotSale");;
      });
      it("Reverts if mint paused", async () => {
        await waitFor(nftContract.setConf(
          [
            presaleStart,
            presaleEnd,
            salePrice,
            maxMintsPerTx,
            maxMintsPresale,
            true
          ]
        ));

        await timeTravel(presaleTimeout + presaleDuration);

        await expect(
          nftContract.saleMint(
            1,
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "MintPaused");
      });
      it("Reverts if is sold out", async () => {
        await waitFor(nftContract.setConf(
          [
            presaleStart,
            presaleEnd,
            salePrice,
            maxSupply + 1,
            maxMintsPresale,
            false
          ]
        ));

        await timeTravel(presaleTimeout + presaleDuration);

        await expect(
          nftContract.saleMint(
            maxSupply + 1,
            { value: salePrice * (maxSupply + 1) }
          )
        ).revertedWithCustomError(nftContract, "CollectionSoldOut");

        await waitFor(nftContract.saleMint(
          maxSupply,
          { value: salePrice * maxSupply }
        ));

        await expect(
          nftContract.saleMint(
            1,
            { value: salePrice }
          )
        ).revertedWithCustomError(nftContract, "CollectionSoldOut");
      });
      it("Reverts if minting more than max per tx", async () => {
        await timeTravel(presaleTimeout + presaleDuration);

        await expect(
          nftContract.saleMint(
            maxMintsPerTx + 1,
            { value: salePrice * (maxMintsPerTx + 1) }
          )
        ).revertedWithCustomError(nftContract, "MaxSaleTxMintsReached");
      });
      it("Reverts if incorrect ETH value sent", async () => {
        await timeTravel(presaleTimeout + presaleDuration);

        await expect(
          nftContract.saleMint(
            1,
            { value: 0 }
          )
        ).revertedWithCustomError(nftContract, "IncorrectETHValue");
        await expect(
          nftContract.saleMint(
            1,
            { value: salePrice - 1 }
          )
        ).revertedWithCustomError(nftContract, "IncorrectETHValue");
        await expect(
          nftContract.saleMint(
            1,
            { value: salePrice + 1 }
          )
        ).revertedWithCustomError(nftContract, "IncorrectETHValue");
      });
    });

    describe("isSoldOut", () => {
      beforeEach(async () => {
        await timeTravel(presaleTimeout + presaleDuration);
        await waitFor(nftContract.setConf(
          [
            presaleStart,
            presaleEnd,
            salePrice,
            maxSupply + 1,
            maxMintsPresale,
            false,
            false,
          ]
        ));
      });
      it("Returns true if is sold out", async () => {
        expect(
          await nftContract.isSoldOut(maxSupply + 1)
        ).true;

        await waitFor(nftContract.saleMint(
          maxSupply,
          { value: salePrice * maxSupply }
        ));

        expect(
          await nftContract.isSoldOut(1)
        ).true;

        expect(await nftContract.totalSupply()).eq(maxSupply);
      });
      it("Returns false if is not sold out", async () => {
        expect(
          await nftContract.isSoldOut(0)
        ).false;

        await waitFor(
          nftContract.saleMint(
            1,
            { value: salePrice }
          )
        );

        expect(
          await nftContract.isSoldOut(maxSupply - 2)
        ).false;
      });
    });


  });
});
