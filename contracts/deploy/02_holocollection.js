module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying contract...", deployer);
  await deploy("HoloCollection", {
    from: deployer,
    log: true,
  });
  console.log("Finished deploying contract");
};
module.exports.tags = ["HoloCollection"];
