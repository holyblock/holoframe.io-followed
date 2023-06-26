/* eslint-disable no-unused-expressions */
const { ethers, upgrades } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Hologram Collection Contract", async () => {
  describe("Holo native collection", async () => {
    let myContract;
    let owner;
    const testTokenURI = "Test";

    it("Should deploy HoloCollection contract", async () => {
      const HoloCollection = await ethers.getContractFactory("HoloCollection");
      [owner] = await ethers.getSigners();
      myContract = await upgrades.deployProxy(HoloCollection, [
        "hologram.xyz",
        "HOLO",
        owner.address,
        ethers.constants.AddressZero, // For native collection, no originAddr
        100,
        0,
      ]);
    });
    describe("mint()", () => {
      it("Should flip sale state to be active", async () => {
        await myContract.flipSaleState();
        expect(await myContract.saleIsActive()).eq(true);
      });
      it("Should emit the Transfer event", async () => {
        await expect(myContract.mint(owner.address, 0, testTokenURI))
          .to.emit(myContract, "Transfer")
          .withArgs(ethers.constants.AddressZero, owner.address, "1");
      });
      it("Returns the NFT ID", async () => {
        await expect(
          await myContract.callStatic.mint(owner.address, 0, testTokenURI)
        ).to.eq("2");
      });
      it("Should increment the NFT ID", async () => {
        const STARTING_NEW_NFT_ID = "2";
        const NEXT_NEW_NFT_ID = "3";

        await expect(myContract.mint(owner.address, 0, testTokenURI))
          .to.emit(myContract, "Transfer")
          .withArgs(
            ethers.constants.AddressZero,
            owner.address,
            STARTING_NEW_NFT_ID
          );

        await expect(myContract.mint(owner.address, 0, testTokenURI))
          .to.emit(myContract, "Transfer")
          .withArgs(
            ethers.constants.AddressZero,
            owner.address,
            NEXT_NEW_NFT_ID
          );
      });

      it("cannot mint to address zero", async () => {
        const TX = myContract.mint(
          ethers.constants.AddressZero,
          0,
          testTokenURI
        );
        await expect(TX).to.be.revertedWith("ERC721: mint to the zero address");
      });
    });
    describe("balanceOf", () => {
      it("gets the count of NFTs for this address", async () => {
        await expect(await myContract.balanceOf(owner.address)).to.eq("3");
        await myContract.mint(owner.address, 0, testTokenURI);
        expect(await myContract.balanceOf(owner.address)).to.eq("4");
      });
    });
    describe("totalSupply()", () => {
      it("Returns the total number of minted tokens", async () => {
        expect(await myContract.maxSupply()).to.eq(100);
        expect(await myContract.totalSupply()).to.eq(4);
      });
    });
  });

  describe("Holo derivative collection", async () => {
    let myContract;
    let testContract;
    let owner;
    const testTokenURI = "Test";

    it("Should deploy test origin contract and mint 3 times", async () => {
      const TestNFT = await ethers.getContractFactory("TestNFT");
      testContract = await TestNFT.deploy();
      [owner] = await ethers.getSigners();
      await testContract.mint(owner.address);
      await testContract.mint(owner.address);
      await testContract.mint(owner.address);
    });

    it("Should deploy HoloCollection contract with origin addr", async () => {
      const HoloCollection = await ethers.getContractFactory("HoloCollection");
      myContract = await upgrades.deployProxy(HoloCollection, [
        "hologram.xyz",
        "HOLO",
        owner.address,
        testContract.address, // For deriv collection, use origin contract addr
        100,
        0,
      ]);
    });
    describe("mint()", () => {
      it("Should flip sale state to be active", async () => {
        await myContract.flipSaleState();
        expect(await myContract.saleIsActive()).eq(true);
      });
      it("Should successfully mint NFT ID 0, 1, and 2", async () => {
        await expect(myContract.mint(owner.address, 0, testTokenURI))
          .to.emit(myContract, "Transfer")
          .withArgs(ethers.constants.AddressZero, owner.address, "0");
        await expect(myContract.mint(owner.address, 1, testTokenURI))
          .to.emit(myContract, "Transfer")
          .withArgs(ethers.constants.AddressZero, owner.address, "1");
        await expect(myContract.mint(owner.address, 2, testTokenURI))
          .to.emit(myContract, "Transfer")
          .withArgs(ethers.constants.AddressZero, owner.address, "2");
      });
      it("Should fail to mint NFT ID 2 again due to it already exists", async () => {
        await expect(
          myContract.mint(owner.address, 2, testTokenURI)
        ).to.be.revertedWith("ERC721: token already minted");
      });
      it("Should unsuccessfully mint NFT ID 3 b/c owner doesn't have original", async () => {
        const TX = myContract.callStatic.mint(owner.address, 3, testTokenURI);
        await expect(TX).to.be.revertedWith(
          "ERC721: owner query for nonexistent token"
        );
      });
    });
    describe("totalSupply()", () => {
      it("Returns the total number of minted tokens", async () => {
        expect(await myContract.maxSupply()).to.eq(100);
        expect(await myContract.totalSupply()).to.eq(3);
      });
    });
  });
});
