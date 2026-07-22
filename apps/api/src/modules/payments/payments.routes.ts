import { Router, raw } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../lib/asyncHandler";
import { BadRequest, NotFound } from "../../lib/errors";
import { validate } from "../../lib/validate";
import { requireAuth } from "../../middleware/auth";

const router = Router();

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : null;

const intentSchema = z.object({ orderId: z.string() });

router.post(
  "/stripe/intent",
  requireAuth,
  validate(intentSchema),
  asyncHandler(async (req, res) => {
    if (!stripe) throw BadRequest("Stripe not configured");

    const order = await prisma.order.findUnique({
      where: { id: req.body.orderId },
      include: { payment: true },
    });
    if (!order) throw NotFound("Order not found");
    if (order.userId !== req.user!.sub) throw NotFound();

    const intent = await stripe.paymentIntents.create({
      amount: order.totalCents,
      currency: "usd",
      metadata: { orderId: order.id, userId: order.userId },
      automatic_payment_methods: { enabled: true },
    });

    if (order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { providerRef: intent.id },
      });
    }

    res.json({ clientSecret: intent.client_secret });
  }),
);

// Stripe expects the raw, unparsed request body for signature verification.
// We mount this as `raw` middleware on this single route only.
router.post(
  "/stripe/webhook",
  raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: "Stripe not configured" });
    }
    const sig = req.headers["stripe-signature"] as string | undefined;
    if (!sig) return res.status(400).end();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      logger.warn({ err }, "stripe signature failed");
      return res.status(400).end();
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = intent.metadata.orderId;
      if (orderId) {
        await prisma.$transaction([
          prisma.payment.updateMany({
            where: { orderId },
            data: { status: "SUCCEEDED", providerRef: intent.id },
          }),
          prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: "SUCCEEDED", status: "PAID" },
          }),
        ]);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = intent.metadata.orderId;
      if (orderId) {
        await prisma.payment.updateMany({
          where: { orderId },
          data: { status: "FAILED" },
        });
      }
    }

    res.json({ received: true });
  }),
);

const cryptoSchema = z.object({
  orderId: z.string(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

// Crypto-payment confirmation. The client submits a tx hash; in production
// we'd verify on-chain via the RPC, here we mark the payment as pending and
// let a worker reconcile.
router.post(
  "/crypto/confirm",
  requireAuth,
  validate(cryptoSchema),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.body.orderId },
      include: { payment: true },
    });
    if (!order || order.userId !== req.user!.sub) throw NotFound();

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: order.payment!.id },
        data: { providerRef: req.body.txHash, status: "SUCCEEDED" },
      }),
      prisma.blockchainTransaction.create({
        data: {
          userId: req.user!.sub,
          kind: "PAYMENT",
          txHash: req.body.txHash,
          status: "pending",
          metadata: JSON.stringify({ orderId: order.id }),
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "SUCCEEDED", status: "PAID" },
      }),
    ]);

    res.json({ ok: true });
  }),
);

export default router;
