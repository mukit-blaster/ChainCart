import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../lib/asyncHandler";
import { validate } from "../../lib/validate";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      include: { sellerProfile: true },
    });
    res.json({ user });
  }),
);

const updateMeSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .nullable()
    .optional(),
});

router.patch(
  "/me",
  validate(updateMeSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: req.body,
    });
    res.json({ user });
  }),
);

// Admin user management
router.get(
  "/",
  requireRole("ADMIN"),
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 25);
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { sellerProfile: true },
      }),
      prisma.user.count(),
    ]);
    res.json({ items, page, pageSize, total });
  }),
);

const sellerStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "SUSPENDED"]),
});

router.patch(
  "/sellers/:id/status",
  requireRole("ADMIN"),
  validate(sellerStatusSchema),
  asyncHandler(async (req, res) => {
    const profile = await prisma.sellerProfile.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json({ profile });
  }),
);

export default router;
