import type { Prisma } from "@prisma/client";
import crypto from "node:crypto";
import { prisma } from "../../config/prisma";
import { Forbidden, NotFound } from "../../lib/errors";
import type { CreateProductInput, ListQuery } from "./products.schema";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

const productSummaryInclude = {
  category: { select: { id: true, name: true, slug: true } },
  // userId is the User.id of the seller — needed to start a chat. We expose
  // it alongside the SellerProfile.id so the UI can wire both flows.
  seller: { select: { id: true, userId: true, displayName: true } },
  images: { orderBy: { position: "asc" as const }, take: 1 },
} satisfies Prisma.ProductInclude;

const productDetailInclude = {
  ...productSummaryInclude,
  images: { orderBy: { position: "asc" as const } },
} satisfies Prisma.ProductInclude;

export const list = async (q: ListQuery) => {
  const where: Prisma.ProductWhereInput = { isPublished: true };

  if (q.q) {
    // SQLite LIKE is case-insensitive for ASCII by default; Postgres needs
    // the explicit `mode` arg, which we add back when migrating to PG.
    where.OR = [
      { title: { contains: q.q } },
      { description: { contains: q.q } },
      { sku: { contains: q.q } },
    ];
  }
  if (q.category) where.category = { slug: q.category };
  if (q.sellerId) where.sellerId = q.sellerId;
  if (q.verifiedOnly) where.isVerified = true;
  if (q.minPrice != null || q.maxPrice != null) {
    where.priceCents = {};
    if (q.minPrice != null) where.priceCents.gte = q.minPrice;
    if (q.maxPrice != null) where.priceCents.lte = q.maxPrice;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    q.sort === "priceAsc"
      ? { priceCents: "asc" }
      : q.sort === "priceDesc"
        ? { priceCents: "desc" }
        : q.sort === "popular"
          ? { reviewCount: "desc" }
          : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: productSummaryInclude,
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(serialize),
    page: q.page,
    pageSize: q.pageSize,
    total,
  };
};

export const getBySlug = async (slug: string) => {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: productDetailInclude,
  });
  if (!p) throw NotFound("Product not found");
  return serializeDetail(p);
};

export const create = async (
  sellerUserId: string,
  input: CreateProductInput,
) => {
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: sellerUserId },
  });
  if (!profile) throw Forbidden("No seller profile");

  // Authenticity hash — stable digest of canonical product data, used as
  // the on-chain identifier for ProductRegistry.register().
  const blockchainHash =
    "0x" +
    crypto
      .createHash("sha256")
      .update(JSON.stringify({ sku: input.sku, title: input.title, sellerId: profile.id }))
      .digest("hex");

  const slug = `${slugify(input.title)}-${profile.id.slice(-4)}`;

  const product = await prisma.product.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      sku: input.sku,
      priceCents: input.priceCents,
      discountPct: input.discountPct,
      stock: input.stock,
      categoryId: input.categoryId ?? null,
      sellerId: profile.id,
      hasNFTWarranty: input.hasNFTWarranty,
      artKind: input.artKind ?? null,
      paletteJson: input.paletteJson ?? null,
      blockchainHash,
      images: {
        create: input.images.map((img, i) => ({
          url: img.url,
          alt: img.alt ?? null,
          position: i,
        })),
      },
    },
    include: productDetailInclude,
  });

  return serializeDetail(product);
};

export const update = async (
  sellerUserId: string,
  id: string,
  input: Partial<CreateProductInput>,
) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { seller: true },
  });
  if (!product) throw NotFound();
  if (product.seller.userId !== sellerUserId) throw Forbidden();

  const updated = await prisma.product.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      priceCents: input.priceCents,
      discountPct: input.discountPct,
      stock: input.stock,
      categoryId: input.categoryId,
      hasNFTWarranty: input.hasNFTWarranty,
      artKind: input.artKind,
      paletteJson: input.paletteJson,
    },
    include: productDetailInclude,
  });

  return serializeDetail(updated);
};

export const remove = async (sellerUserId: string, id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { seller: true },
  });
  if (!product) throw NotFound();
  if (product.seller.userId !== sellerUserId) throw Forbidden();
  // Soft-unpublish instead of delete so historical orders remain readable.
  await prisma.product.update({
    where: { id },
    data: { isPublished: false },
  });
};

const serialize = (p: Prisma.ProductGetPayload<{ include: typeof productSummaryInclude }>) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  priceCents: p.priceCents,
  discountPct: p.discountPct,
  rating: p.rating,
  reviewCount: p.reviewCount,
  stock: p.stock,
  category: p.category,
  seller: p.seller,
  primaryImage: p.images[0]
    ? { id: p.images[0].id, url: p.images[0].url, alt: p.images[0].alt }
    : null,
  isVerified: p.isVerified,
  hasNFTWarranty: p.hasNFTWarranty,
  artKind: p.artKind,
  paletteJson: p.paletteJson,
});

const serializeDetail = (
  p: Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>,
) => ({
  ...serialize(p),
  description: p.description,
  sku: p.sku,
  blockchainHash: p.blockchainHash,
  images: p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
  createdAt: p.createdAt.toISOString(),
});
