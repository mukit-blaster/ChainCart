import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../lib/asyncHandler";
import { NotFound } from "../../lib/errors";
import { validate } from "../../lib/validate";
import { requireAuth } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

const upsertSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.sub },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { position: "asc" } },
            seller: { select: { id: true, displayName: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ items });
  }),
);

router.post(
  "/",
  validate(upsertSchema),
  asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isPublished) throw NotFound("Product not available");

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.user!.sub, productId } },
      create: { userId: req.user!.sub, productId, quantity },
      update: { quantity },
    });
    res.status(201).json(item);
  }),
);

router.delete(
  "/:productId",
  asyncHandler(async (req, res) => {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user!.sub, productId: req.params.productId },
    });
    res.status(204).end();
  }),
);

router.delete(
  "/",
  asyncHandler(async (req, res) => {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.sub } });
    res.status(204).end();
  }),
);

export default router;
