import { prisma } from "../../config/prisma";
import { BadRequest, Forbidden, NotFound } from "../../lib/errors";
import { randomId } from "../../lib/hash";

interface CheckoutInput {
  paymentMethod: "STRIPE" | "CRYPTO" | "BKASH";
  shippingAddress: Record<string, unknown>;
}

const TAX_RATE = 0.07;
const FLAT_SHIPPING_CENTS = 999;

// Build an order from the user's cart in a single transaction. We snapshot
// the price + title onto each OrderItem so historical orders survive product
// edits/deletes.
export const checkout = async (userId: string, input: CheckoutInput) => {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    if (cart.length === 0) throw BadRequest("Cart is empty");

    let subtotalCents = 0;
    const lines = cart.map((c) => {
      if (c.product.stock < c.quantity) {
        throw BadRequest(`Insufficient stock for ${c.product.title}`);
      }
      const unit =
        c.product.priceCents *
        (1 - (c.product.discountPct ?? 0) / 100);
      const totalCents = Math.round(unit * c.quantity);
      subtotalCents += totalCents;
      return {
        productId: c.productId,
        titleSnapshot: c.product.title,
        unitPriceCents: Math.round(unit),
        quantity: c.quantity,
        totalCents,
      };
    });

    const taxCents = Math.round(subtotalCents * TAX_RATE);
    const shippingCents = FLAT_SHIPPING_CENTS;
    const totalCents = subtotalCents + taxCents + shippingCents;

    const order = await tx.order.create({
      data: {
        number: `CC-${Date.now().toString(36).toUpperCase()}-${randomId(2).toUpperCase()}`,
        userId,
        paymentMethod: input.paymentMethod,
        subtotalCents,
        taxCents,
        shippingCents,
        totalCents,
        shippingAddress: JSON.stringify(input.shippingAddress),
        items: { create: lines },
        payment: {
          create: {
            method: input.paymentMethod,
            amountCents: totalCents,
          },
        },
      },
      include: { items: true, payment: true },
    });

    // Decrement stock atomically. If anyone else races, $transaction rolls back.
    for (const c of cart) {
      await tx.product.update({
        where: { id: c.productId },
        data: { stock: { decrement: c.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId } });

    return order;
  });
};

export const listForUser = (userId: string) =>
  prisma.order.findMany({
    where: { userId },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

export const getById = async (userId: string, role: string, id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, warranties: true },
  });
  if (!order) throw NotFound();
  if (role !== "ADMIN" && order.userId !== userId) throw Forbidden();
  return order;
};

export const updateStatus = async (
  id: string,
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
  trackingNumber?: string,
) => {
  return prisma.order.update({
    where: { id },
    data: { status, trackingNumber },
  });
};
