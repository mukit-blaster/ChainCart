import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { validate } from "../../lib/validate";
import { requireAuth } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimit";
import * as ctrl from "./auth.controller";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  walletLoginSchema,
  walletNonceSchema,
} from "./auth.schema";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  asyncHandler(ctrl.register),
);
router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  asyncHandler(ctrl.login),
);
router.post("/refresh", asyncHandler(ctrl.refresh));
// Allow body fallback so non-cookie clients (mobile, server-side) work too.
router.post("/refresh-body", validate(refreshSchema), asyncHandler(ctrl.refresh));
router.post("/logout", asyncHandler(ctrl.logout));
router.get("/me", requireAuth, asyncHandler(ctrl.me));

router.post(
  "/wallet/nonce",
  authLimiter,
  validate(walletNonceSchema),
  asyncHandler(ctrl.walletNonce),
);
router.post(
  "/wallet/login",
  authLimiter,
  validate(walletLoginSchema),
  asyncHandler(ctrl.walletLogin),
);

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(ctrl.forgotPassword),
);
router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  asyncHandler(ctrl.resetPassword),
);

export default router;
