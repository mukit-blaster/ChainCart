import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../lib/asyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ items });
  }),
);

export default router;
