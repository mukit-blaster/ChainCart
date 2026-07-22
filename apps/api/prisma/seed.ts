// Seeds a realistic demo dataset that mirrors the prototype:
//   - 1 admin, 1 customer, 2 sellers
//   - 9 categories, 8 products with the prototype palettes/art kinds
// Run with: npm --workspace apps/api run prisma:seed

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const hashOf = (sku: string, title: string, sellerId: string) =>
  "0x" +
  crypto
    .createHash("sha256")
    .update(JSON.stringify({ sku, title, sellerId }))
    .digest("hex");

const productSpecs = [
  { name: "Nomad Chrono 38", cat: "Watches", seller: "Helix Atelier", price: 184900, kind: "watch", palette: ["#dbeafe", "#c7d2fe", "#2563EB"] },
  { name: "Aero Runner v3", cat: "Sneakers", seller: "Forma Studio", price: 21900, kind: "sneaker", palette: ["#dcfce7", "#a7f3d0", "#10B981"] },
  { name: "Halcyon Phone Pro", cat: "Electronics", seller: "Helix Atelier", price: 129900, kind: "phone", palette: ["#fef3c7", "#fde68a", "#F59E0B"] },
  { name: "Mira Tote · Caramel", cat: "Bags", seller: "Forma Studio", price: 69500, kind: "bag", palette: ["#fee2e2", "#fecaca", "#EF4444"] },
  { name: "Edition №14 — Drift", cat: "Art", seller: "Helix Atelier", price: 38000, kind: "art", palette: ["#ede9fe", "#ddd6fe", "#8B5CF6"] },
  { name: "Sona Studio Headphones", cat: "Audio", seller: "Forma Studio", price: 29900, kind: "headphones", palette: ["#cffafe", "#a5f3fc", "#06b6d4"] },
  { name: "Lumen M2 Mirrorless", cat: "Cameras", seller: "Helix Atelier", price: 209900, kind: "camera", palette: ["#e0e7ff", "#c7d2fe", "#6366f1"] },
  { name: "Perch Lounge Chair", cat: "Home", seller: "Forma Studio", price: 89000, kind: "chair", palette: ["#fce7f3", "#fbcfe8", "#ec4899"] },
];

const categoryNames = ["Watches", "Sneakers", "Electronics", "Bags", "Art", "Audio", "Cameras", "Home"];

async function main() {
  console.log("🌱 seeding…");

  // Users
  const passwordHash = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@chaincart.dev" },
    update: {},
    create: {
      email: "admin@chaincart.dev",
      name: "Ada Admin",
      passwordHash,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@chaincart.dev" },
    update: {},
    create: {
      email: "customer@chaincart.dev",
      name: "Casey Customer",
      passwordHash,
      role: "CUSTOMER",
      emailVerifiedAt: new Date(),
    },
  });

  const sellerUsers: Record<string, { userId: string; profileId: string }> = {};
  for (const display of ["Helix Atelier", "Forma Studio"]) {
    const u = await prisma.user.upsert({
      where: { email: `${slugify(display)}@chaincart.dev` },
      update: {},
      create: {
        email: `${slugify(display)}@chaincart.dev`,
        name: display,
        passwordHash,
        role: "SELLER",
        emailVerifiedAt: new Date(),
      },
    });
    const profile = await prisma.sellerProfile.upsert({
      where: { userId: u.id },
      update: { status: "APPROVED" },
      create: {
        userId: u.id,
        displayName: display,
        bio: `Curator at ${display} — verified ChainCart seller.`,
        status: "APPROVED",
      },
    });
    sellerUsers[display] = { userId: u.id, profileId: profile.id };
  }

  // Categories
  const categories: Record<string, { id: string }> = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
    categories[name] = { id: cat.id };
  }

  // Products
  for (const spec of productSpecs) {
    const sellerProfileId = sellerUsers[spec.seller].profileId;
    const sku = `CC-${slugify(spec.name).toUpperCase().slice(0, 12)}`;
    const slug = `${slugify(spec.name)}-${sellerProfileId.slice(-4)}`;
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: spec.name,
        description: `A signature piece from ${spec.seller}. Verified on-chain authenticity, 5-year NFT warranty included.`,
        sku,
        priceCents: spec.price,
        discountPct: 0,
        stock: 50,
        rating: 4.7,
        reviewCount: 0,
        isVerified: true,
        hasNFTWarranty: true,
        artKind: spec.kind,
        paletteJson: JSON.stringify(spec.palette),
        blockchainHash: hashOf(sku, spec.name, sellerProfileId),
        categoryId: categories[spec.cat].id,
        sellerId: sellerProfileId,
      },
    });
  }

  // Demo conversation — gives the customer something to see at /chat.
  // Idempotent: skip if a conversation already exists for this pair+product.
  const helixSeller = await prisma.user.findUnique({
    where: { email: "helix-atelier@chaincart.dev" },
  });
  const watch = await prisma.product.findFirst({ where: { artKind: "watch" } });
  if (helixSeller && watch) {
    const existing = await prisma.conversation.findFirst({
      where: {
        customerId: customer.id,
        sellerId: helixSeller.id,
        productId: watch.id,
      },
    });
    if (!existing) {
      const now = Date.now();
      const minute = 60_000;
      const conv = await prisma.conversation.create({
        data: {
          customerId: customer.id,
          sellerId: helixSeller.id,
          productId: watch.id,
          lastMessageAt: new Date(now),
          messages: {
            create: [
              {
                senderId: customer.id,
                body: `Hi! Is the ${watch.title} still available? I'd love to know more about the warranty.`,
                createdAt: new Date(now - 4 * minute),
              },
              {
                senderId: helixSeller.id,
                body: "Hey Casey — yes, in stock. Each piece ships with a 5-year NFT warranty registered to your wallet.",
                createdAt: new Date(now - 3 * minute),
              },
              {
                senderId: customer.id,
                body: "Perfect. Are there sizing options?",
                createdAt: new Date(now - 2 * minute),
              },
              {
                senderId: helixSeller.id,
                body: "It comes in 38mm and 42mm. Strap is interchangeable. Want me to send the size guide?",
                createdAt: new Date(now - 1 * minute),
              },
            ],
          },
        },
      });
      console.log(`   chat:     seeded conversation ${conv.id} with 4 messages`);
    }
  }

  console.log("✅ seed complete");
  console.log("   admin:    admin@chaincart.dev / password123");
  console.log("   customer: customer@chaincart.dev / password123");
  console.log("   sellers:  helix-atelier@chaincart.dev, forma-studio@chaincart.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
