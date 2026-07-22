import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../lib/asyncHandler";
import { validate } from "../../lib/validate";
import { requireAuth } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.sub },
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { position: "asc" } },
            seller: { select: { id: true, displayName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  }),
);

const toggleSchema = z.object({ productId: z.string() });

router.post(
  "/toggle",
  validate(toggleSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId: req.body.productId } },
    });
    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return res.json({ saved: false });
    }
    await prisma.wishlistItem.create({
      data: { userId, productId: req.body.productId },
    });
    res.json({ saved: true });
  }),
);

export default router;
