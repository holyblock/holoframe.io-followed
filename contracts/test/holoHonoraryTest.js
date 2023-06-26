/* eslint-disable no-unused-expressions */
const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Hologram Honorary Contract", async function () {
  describe("HoloHonorary", async function () {
    let myContract;
    let owner;
    const testTokenURI = "Test";

    it("Should deploy HoloHonorary contract", async function () {
      const HoloHonorary = await ethers.getContractFactory("HoloHonorary");
      myContract = await HoloHonorary.deploy("Test Contract");
      [owner] = await ethers.getSigners();
    });
    describe("mint()", function () {
      it("Should emit the Transfer event", async function () {
        await expect(myContract.mint(owner.address, testTokenURI))
          .to.emit(myContract, "Transfer")
          .withArgs(ethers.constants.AddressZero, owner.address, "1");
      });
      it("Returns the NFT ID", async function () {
        await expect(
          await myContract.callStatic.mint(owner.address, testTokenURI)
        ).to.eq("2");
      });
      it("Should increment the NFT ID", async () => {
        const STARTING_NEW_NFT_ID = "2";
        const NEXT_NEW_NFT_ID = "3";

        await expect(myContract.mint(owner.address, testTokenURI))
          .to.emit(myContract, "Transfer")
          .withArgs(
            ethers.constants.AddressZero,
            owner.address,
            STARTING_NEW_NFT_ID
          );

        await expect(myContract.mint(owner.address, testTokenURI))
          .to.emit(myContract, "Transfer")
          .withArgs(
            ethers.constants.AddressZero,
            owner.address,
            NEXT_NEW_NFT_ID
          );
      });

      it("cannot mint to address zero", async () => {
        const TX = myContract.mint(ethers.constants.AddressZero, testTokenURI);
        await expect(TX).to.be.revertedWith("ERC721: mint to the zero address");
      });

      describe("balanceOf", () => {
        it("gets the count of NFTs for this address", async () => {
          await expect(await myContract.balanceOf(owner.address)).to.eq("3");
          await myContract.mint(owner.address, testTokenURI);
          expect(await myContract.balanceOf(owner.address)).to.eq("4");
        });
      });
    });
  });
});
