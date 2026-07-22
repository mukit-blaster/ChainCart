import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../lib/asyncHandler";
import { Forbidden, NotFound } from "../../lib/errors";
import { validate } from "../../lib/validate";
import { requireAuth } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get(
  "/conversations",
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const items = await prisma.conversation.findMany({
      where: { OR: [{ customerId: userId }, { sellerId: userId }] },
      include: {
        customer: { select: { id: true, name: true, avatarUrl: true } },
        seller: { select: { id: true, name: true, avatarUrl: true } },
        product: { select: { id: true, title: true, slug: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
    });
    res.json({ items });
  }),
);

const startSchema = z.object({
  sellerId: z.string(),
  productId: z.string().optional(),
});

router.post(
  "/conversations",
  validate(startSchema),
  asyncHandler(async (req, res) => {
    const customerId = req.user!.sub;
    if (customerId === req.body.sellerId) throw Forbidden("Cannot DM yourself");

    const existing = await prisma.conversation.findFirst({
      where: {
        customerId,
        sellerId: req.body.sellerId,
        productId: req.body.productId ?? null,
      },
    });
    const conversation =
      existing ??
      (await prisma.conversation.create({
        data: {
          customerId,
          sellerId: req.body.sellerId,
          productId: req.body.productId ?? null,
        },
      }));
    res.status(201).json(conversation);
  }),
);

router.get(
  "/conversations/:id/messages",
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const conv = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });
    if (!conv) throw NotFound();
    if (conv.customerId !== userId && conv.sellerId !== userId) throw Forbidden();

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    res.json({ items: messages });
  }),
);

const sendSchema = z.object({
  body: z.string().min(1).max(4000),
  attachmentUrl: z.string().url().optional(),
});

router.post(
  "/conversations/:id/messages",
  validate(sendSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user!.sub;
    const conv = await prisma.conversation.findUnique({
      where: { id: req.params.id },
    });
    if (!conv) throw NotFound();
    if (conv.customerId !== userId && conv.sellerId !== userId) throw Forbidden();

    const message = await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: userId,
        body: req.body.body,
        attachmentUrl: req.body.attachmentUrl ?? null,
      },
    });
    await prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessageAt: new Date() },
    });
    res.status(201).json(message);
  }),
);

export default router;
