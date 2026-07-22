import { Router } from "express";
import crypto from "node:crypto";
import { env } from "../../config/env";
import { asyncHandler } from "../../lib/asyncHandler";
import { BadRequest } from "../../lib/errors";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// Cloudinary signed upload — keeps secret out of the browser. The client
// sends the resulting params straight to Cloudinary's REST endpoint.
router.post(
  "/cloudinary/sign",
  requireAuth,
  asyncHandler(async (_req, res) => {
    if (!env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_CLOUD_NAME) {
      throw BadRequest("Cloudinary is not configured");
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "chaincart/products";
    const toSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(toSign + env.CLOUDINARY_API_SECRET)
      .digest("hex");

    res.json({
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  }),
);

export default router;
