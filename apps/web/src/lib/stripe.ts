"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Lazy singleton — Stripe.js script only loads when checkout actually mounts.
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key || key.startsWith("pk_test_xxx")) return null;
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export const isStripeConfigured = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return Boolean(key && !key.startsWith("pk_test_xxx"));
};
