import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler, notFound } from "./middleware/error";
import { apiLimiter } from "./middleware/rateLimit";
import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/products.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/orders/orders.routes";
import paymentRoutes from "./modules/payments/payments.routes";
import blockchainRoutes from "./modules/blockchain/blockchain.routes";
import chatRoutes from "./modules/chat/chat.routes";
import userRoutes from "./modules/users/users.routes";
import reviewRoutes from "./modules/reviews/reviews.routes";
import wishlistRoutes from "./modules/wishlist/wishlist.routes";
import uploadRoutes from "./modules/uploads/uploads.routes";
import categoryRoutes from "./modules/categories/categories.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";

export const buildApp = () => {
  const app = express();
  app.set("trust proxy", 1);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(compression());

  // Stripe webhook needs the raw body — mount that subroute BEFORE the JSON
  // parser so the webhook handler sees the unparsed bytes.
  app.use("/api/payments/stripe/webhook", paymentRoutes);

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan("tiny", { stream: { write: (m) => logger.debug(m.trim()) } }));
  app.use("/api", apiLimiter);

  app.get("/api/health", (_req, res) => res.json({ ok: true, env: env.NODE_ENV }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/blockchain", blockchainRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api/analytics", analyticsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
