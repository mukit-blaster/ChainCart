import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../lib/asyncHandler";
import { BadRequest } from "../../lib/errors";
import { validate } from "../../lib/validate";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.get(
  "/:productId",
  asyncHandler(async (req, res) => {
    const items = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ items });
  }),
);

const createSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(2).max(2000),
});

router.post(
  "/",
  requireAuth,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    // Only allow reviewing if the user actually purchased the product.
    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId: req.body.productId,
        order: { userId: req.user!.sub, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      },
    });
    if (!purchased) throw BadRequest("Only buyers can review this product");

    const review = await prisma.review.upsert({
      where: {
        productId_userId: {
          productId: req.body.productId,
          userId: req.user!.sub,
        },
      },
      create: {
        productId: req.body.productId,
        userId: req.user!.sub,
        rating: req.body.rating,
        body: req.body.body,
      },
      update: {
        rating: req.body.rating,
        body: req.body.body,
      },
    });

    // Recompute aggregates so the product card shows the up-to-date rating.
    const agg = await prisma.review.aggregate({
      where: { productId: req.body.productId },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: req.body.productId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });

    res.status(201).json(review);
  }),
);

export default router;
