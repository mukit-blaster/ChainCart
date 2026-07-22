import { expect } from "chai";
import { ethers } from "hardhat";

describe("WarrantyNFT", () => {
  it("mints a warranty token to a user", async () => {
    const [owner, customer] = await ethers.getSigners();
    const W = await (await ethers.getContractFactory("WarrantyNFT")).deploy();

    const productHash = ethers.keccak256(ethers.toUtf8Bytes("sku:p1"));
    const orderRef = ethers.keccak256(ethers.toUtf8Bytes("order:o1"));
    const until = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 5;

    await expect(
      W.mintWarranty(
        await customer.getAddress(),
        productHash,
        orderRef,
        until,
        "ipfs://example",
      ),
    ).to.emit(W, "WarrantyMinted");

    expect(await W.ownerOf(1)).to.equal(await customer.getAddress());
    expect(await W.isValid(1)).to.equal(true);
  });

  it("rejects mints from non-minters", async () => {
    const [, attacker] = await ethers.getSigners();
    const W = await (await ethers.getContractFactory("WarrantyNFT")).deploy();
    await expect(
      W.connect(attacker).mintWarranty(
        await attacker.getAddress(),
        ethers.ZeroHash,
        ethers.ZeroHash,
        0,
        "",
      ),
    ).to.be.revertedWithCustomError(W, "NotMinter");
  });
});
