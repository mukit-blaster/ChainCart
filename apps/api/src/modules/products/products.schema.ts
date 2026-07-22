import { z } from "zod";

export const listQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  sort: z
    .enum(["new", "priceAsc", "priceDesc", "popular"])
    .default("new")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(60).default(24),
  sellerId: z.string().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
});

export const createProductSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  priceCents: z.number().int().positive(),
  discountPct: z.number().int().min(0).max(90).default(0),
  stock: z.number().int().nonnegative().default(0),
  sku: z.string().min(2).max(64),
  categoryId: z.string().optional(),
  hasNFTWarranty: z.boolean().default(false),
  artKind: z.string().optional(),
  paletteJson: z.string().optional(),
  images: z
    .array(z.object({ url: z.string().url(), alt: z.string().optional() }))
    .default([]),
});

export const updateProductSchema = createProductSchema.partial();

export type ListQuery = z.infer<typeof listQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
