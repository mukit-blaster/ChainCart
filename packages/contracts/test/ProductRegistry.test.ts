import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProductRegistry", () => {
  it("registers and verifies products", async () => {
    const [owner, seller] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("ProductRegistry");
    const reg = await Registry.deploy();
    await reg.registerSeller(await seller.getAddress());

    const hash = ethers.keccak256(ethers.toUtf8Bytes("sku:nomad-chrono-38"));
    await reg.connect(seller).registerProduct(hash);

    const [registered, sellerAddr] = await reg.verify(hash);
    expect(registered).to.equal(true);
    expect(sellerAddr).to.equal(await seller.getAddress());
  });

  it("rejects duplicates and non-sellers", async () => {
    const [, seller, attacker] = await ethers.getSigners();
    const reg = await (await ethers.getContractFactory("ProductRegistry")).deploy();
    await reg.registerSeller(await seller.getAddress());

    const hash = ethers.keccak256(ethers.toUtf8Bytes("sku:dupe"));
    await reg.connect(seller).registerProduct(hash);

    await expect(reg.connect(seller).registerProduct(hash)).to.be.revertedWithCustomError(
      reg,
      "AlreadyRegistered",
    );
    await expect(reg.connect(attacker).registerProduct(ethers.keccak256(ethers.toUtf8Bytes("nope"))))
      .to.be.revertedWithCustomError(reg, "NotSeller");
  });
});
