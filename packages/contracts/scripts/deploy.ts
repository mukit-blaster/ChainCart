import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", await deployer.getAddress());

  const Registry = await ethers.getContractFactory("ProductRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const Warranty = await ethers.getContractFactory("WarrantyNFT");
  const warranty = await Warranty.deploy();
  await warranty.waitForDeployment();

  console.log("ProductRegistry:", await registry.getAddress());
  console.log("WarrantyNFT:    ", await warranty.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
