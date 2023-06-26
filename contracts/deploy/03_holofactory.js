const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const collectionAddress = (await deployments.get("HoloCollection")).address;
  const chainId = await getChainId();

  await deploy("HoloFactory", {
    from: deployer,
    args: [collectionAddress],
    log: true,
  });

  // Transfer ownership of factory contract to multisig
  if (chainId === 1) {
    const HoloFactory = await ethers.getContract("HoloFactory", deployer);
    await HoloFactory.transferOwnership(process.env.MULTISIG_ADDR);
  }
};
module.exports.tags = ["SingleEditionMintableCreator"];
module.exports.dependencies = ["HoloCollection"];
