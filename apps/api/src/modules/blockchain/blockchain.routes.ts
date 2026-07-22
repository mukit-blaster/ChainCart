import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../lib/asyncHandler";
import { getOnChain, networkLabel } from "../../lib/contracts";
import { BadRequest, Forbidden, NotFound } from "../../lib/errors";
import { validate } from "../../lib/validate";
import { requireAuth, requireRole } from "../../middleware/auth";

const randomTxHash = () =>
  "0x" +
  Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

const router = Router();

// Public verification — anyone can check if a product hash is registered on
// our local PoC chain. Returns a stable shape regardless of chain state.
const verifySchema = z.object({
  productSlug: z.string().optional(),
  hash: z.string().optional(),
});

router.post(
  "/verify",
  validate(verifySchema),
  asyncHandler(async (req, res) => {
    const { productSlug, hash } = req.body;
    if (!productSlug && !hash) throw BadRequest("Provide productSlug or hash");

    const product = await prisma.product.findFirst({
      where: productSlug
        ? { slug: productSlug }
        : { blockchainHash: hash },
      include: {
        seller: { select: { displayName: true } },
        category: { select: { name: true } },
      },
    });

    if (!product || !product.blockchainHash) {
      return res.json({ verified: false, reason: "not_registered" });
    }

    res.json({
      verified: true,
      hash: product.blockchainHash,
      product: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        seller: product.seller.displayName,
        category: product.category?.name ?? null,
      },
      contract: env.PRODUCT_REGISTRY_ADDRESS ?? null,
      network: env.CHAIN_ID ? `chain-${env.CHAIN_ID}` : "local",
    });
  }),
);

const mintSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
});

// Warranty mint. If on-chain config is present we call WarrantyNFT.mintWarranty
// for real and read the tokenId from the emitted event; otherwise we simulate
// the tx so dev environments demo the full flow.
router.post(
  "/warranty/mint",
  requireAuth,
  requireRole("SELLER", "ADMIN"),
  validate(mintSchema),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.body.orderId },
      include: { items: true, user: true },
    });
    if (!order) throw NotFound();
    const item = order.items.find((i) => i.productId === req.body.productId);
    if (!item) throw BadRequest("Product not in order");

    const product = await prisma.product.findUnique({
      where: { id: req.body.productId },
    });
    if (!product?.blockchainHash) throw BadRequest("Product has no on-chain hash");

    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 5);

    const onchain = getOnChain();
    let tokenId: string;
    let txHash: string;
    let blockNumber: number | null = null;
    let txStatus = "confirmed";

    if (onchain?.warranty && order.user.walletAddress) {
      // Real path. Order ref is keccak256(orderId) — packed and hashed off-chain.
      const { ethers } = await import("ethers");
      const orderRef = ethers.keccak256(ethers.toUtf8Bytes(order.id));
      const validUntilUnix = Math.floor(validUntil.getTime() / 1000);

      try {
        const tx = await onchain.warranty.mintWarranty(
          order.user.walletAddress,
          product.blockchainHash,
          orderRef,
          validUntilUnix,
          `chaincart://warranty/${order.id}/${product.id}`,
        );
        const receipt = await tx.wait();
        txHash = receipt.hash;
        blockNumber = receipt.blockNumber;

        // Extract tokenId from the WarrantyMinted event.
        const event = receipt.logs
          .map((l: { topics: ReadonlyArray<string>; data: string }) => {
            try {
              return onchain.warranty!.interface.parseLog({ topics: [...l.topics], data: l.data });
            } catch {
              return null;
            }
          })
          .find((p: { name: string } | null) => p?.name === "WarrantyMinted");
        tokenId = event ? String(event.args[0]) : `${Date.now()}`;
      } catch (err) {
        logger.error({ err }, "On-chain warranty mint failed; falling back");
        tokenId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
        txHash = randomTxHash();
        txStatus = "failed";
      }
    } else {
      // Simulation path (no RPC, no contracts, or buyer hasn't linked a wallet).
      tokenId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
      txHash = randomTxHash();
    }

    const warranty = await prisma.nFTWarranty.create({
      data: {
        tokenId,
        contractAddress: env.WARRANTY_NFT_ADDRESS ?? "0x0",
        productId: req.body.productId,
        orderId: order.id,
        ownerId: order.userId,
        validUntil,
        txHash,
      },
    });

    await prisma.blockchainTransaction.create({
      data: {
        userId: order.userId,
        kind: "WARRANTY_MINT",
        txHash,
        network: networkLabel(),
        status: txStatus,
        blockNumber,
        metadata: JSON.stringify({ tokenId, productId: req.body.productId }),
      },
    });

    res.status(201).json({ ...warranty, txHash, blockNumber });
  }),
);

router.get(
  "/warranties/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await prisma.nFTWarranty.findMany({
      where: { ownerId: req.user!.sub },
      include: { product: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  }),
);

router.get(
  "/transactions/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await prisma.blockchainTransaction.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ items });
  }),
);

router.get(
  "/transactions",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const items = await prisma.blockchainTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json({ items });
  }),
);

// Admin/seller helper for pinning a product hash to the registry.
router.post(
  "/products/:id/register",
  requireAuth,
  requireRole("SELLER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { seller: true },
    });
    if (!product) throw NotFound();
    if (req.user!.role !== "ADMIN" && product.seller.userId !== req.user!.sub) {
      throw Forbidden();
    }
    if (!product.blockchainHash) throw BadRequest("Product missing hash");

    const onchain = getOnChain();
    let txHash: string;
    let blockNumber: number | null = null;
    let txStatus = "confirmed";

    if (onchain?.registry) {
      try {
        const tx = await onchain.registry.registerProduct(product.blockchainHash);
        const receipt = await tx.wait();
        txHash = receipt.hash;
        blockNumber = receipt.blockNumber;
      } catch (err) {
        logger.error({ err }, "On-chain product registration failed; falling back");
        txHash = randomTxHash();
        txStatus = "failed";
      }
    } else {
      txHash = randomTxHash();
    }

    await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { isVerified: txStatus === "confirmed" },
      }),
      prisma.blockchainTransaction.create({
        data: {
          userId: req.user!.sub,
          kind: "PRODUCT_REGISTRATION",
          txHash,
          network: networkLabel(),
          status: txStatus,
          blockNumber,
          metadata: JSON.stringify({ productId: product.id, hash: product.blockchainHash }),
        },
      }),
    ]);

    res.json({ ok: txStatus === "confirmed", txHash, blockNumber, hash: product.blockchainHash });
  }),
);

export default router;
