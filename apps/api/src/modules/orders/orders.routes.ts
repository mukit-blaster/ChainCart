import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/asyncHandler";
import { validate } from "../../lib/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as svc from "./orders.service";

const router = Router();
router.use(requireAuth);

const checkoutSchema = z.object({
  paymentMethod: z.enum(["STRIPE", "CRYPTO", "BKASH"]),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    region: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(2).max(2),
    phone: z.string().optional(),
    fullName: z.string().min(1),
  }),
});

const updateStatusSchema = z.object({
  status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingNumber: z.string().optional(),
});

router.post(
  "/checkout",
  validate(checkoutSchema),
  asyncHandler(async (req, res) => {
    const order = await svc.checkout(req.user!.sub, req.body);
    res.status(201).json(order);
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({ items: await svc.listForUser(req.user!.sub) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await svc.getById(req.user!.sub, req.user!.role, req.params.id));
  }),
);

router.patch(
  "/:id/status",
  requireRole("SELLER", "ADMIN"),
  validate(updateStatusSchema),
  asyncHandler(async (req, res) => {
    res.json(
      await svc.updateStatus(req.params.id, req.body.status, req.body.trackingNumber),
    );
  }),
);

export default router;
