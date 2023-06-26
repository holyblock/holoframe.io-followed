/* eslint-disable no-unused-expressions */
const { ethers } = require("hardhat");
const { use } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Hologram Factory Contract", async () => {
  describe("Using HoloCollection as implementation", async () => {
    let myFactory;
    let myImplementation;
    let owner;
    // const testTokenURI = "Test";

    it("Should deploy HoloFactory contract and its implemntation", async () => {
      const HoloFactory = await ethers.getContractFactory("HoloFactory");
      const HoloCollection = await ethers.getContractFactory("HoloCollection");
      [owner] = await ethers.getSigners();

      myImplementation = HoloCollection.deploy();
      myFactory = HoloFactory.deploy(myImplementation);
      myFactory.createCollection(
        "hologram.xyz",
        "HOLO",
        owner.address,
        ethers.constants.AddressZero, // For native collection, no originAddr
        100,
        0
      );
    });
    // describe("mint()", () => {
    //   it("cannot mint to address zero", async () => {
    //     const TX = myFactory.mint(
    //       ethers.constants.AddressZero,
    //       0,
    //       testTokenURI
    //     );
    //     await expect(TX).to.be.revertedWith("ERC721: mint to the zero address");
    //   });
    // });
  });
});
