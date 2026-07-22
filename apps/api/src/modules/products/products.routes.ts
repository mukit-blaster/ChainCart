import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { validate } from "../../lib/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as svc from "./products.service";
import {
  createProductSchema,
  listQuerySchema,
  updateProductSchema,
} from "./products.schema";

const router = Router();

router.get(
  "/",
  validate(listQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    res.json(await svc.list(req.query as never));
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    res.json(await svc.getBySlug(req.params.slug));
  }),
);

router.post(
  "/",
  requireAuth,
  requireRole("SELLER", "ADMIN"),
  validate(createProductSchema),
  asyncHandler(async (req, res) => {
    const product = await svc.create(req.user!.sub, req.body);
    res.status(201).json(product);
  }),
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("SELLER", "ADMIN"),
  validate(updateProductSchema),
  asyncHandler(async (req, res) => {
    res.json(await svc.update(req.user!.sub, req.params.id, req.body));
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("SELLER", "ADMIN"),
  asyncHandler(async (req, res) => {
    await svc.remove(req.user!.sub, req.params.id);
    res.status(204).end();
  }),
);

export default router;
