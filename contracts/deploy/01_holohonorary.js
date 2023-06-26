module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying contract...", deployer);
  await deploy("HoloHonorary", {
    from: deployer,
    args: ["hologram.xyz"],
    log: true,
  });
  console.log("Finished deploying contract");
};
module.exports.tags = ["HoloHonorary"];
