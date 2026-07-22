import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

// Buckets the last N days for a sparkline. Implemented in JS over a small
// fetch to stay portable across SQLite (local dev) and Postgres (prod).
const dailyRevenue = async (where: { sellerProfileId?: string }) => {
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
      ...(where.sellerProfileId
        ? { items: { some: { product: { sellerId: where.sellerProfileId } } } }
        : {}),
    },
    select: { createdAt: true, totalCents: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const buckets = new Map<string, number>();
  for (const o of orders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    buckets.set(day, (buckets.get(day) ?? 0) + o.totalCents);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-14)
    .map(([day, totalCents]) => ({ day, totalCents }));
};

router.get(
  "/seller/me",
  requireRole("SELLER", "ADMIN"),
  asyncHandler(async (req, res) => {
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user!.sub },
    });
    if (!profile) return res.json({ revenue: [], totals: {} });

    const [revenue, products, orders] = await Promise.all([
      dailyRevenue({ sellerProfileId: profile.id }),
      prisma.product.count({ where: { sellerId: profile.id, isPublished: true } }),
      prisma.orderItem.count({ where: { product: { sellerId: profile.id } } }),
    ]);

    const totalCents = revenue.reduce((s, r) => s + r.totalCents, 0);
    res.json({
      revenue,
      totals: { products, orders, totalCents },
    });
  }),
);

router.get(
  "/admin",
  requireRole("ADMIN"),
  asyncHandler(async (_req, res) => {
    const [users, sellers, products, orders, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.sellerProfile.count(),
      prisma.product.count({ where: { isPublished: true } }),
      prisma.order.count(),
      dailyRevenue({}),
    ]);
    res.json({ totals: { users, sellers, products, orders }, revenue });
  }),
);

export default router;
