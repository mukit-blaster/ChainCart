export const Role = {
  CUSTOMER: "CUSTOMER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  STRIPE: "STRIPE",
  CRYPTO: "CRYPTO",
  BKASH: "BKASH",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const SellerStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  SUSPENDED: "SUSPENDED",
} as const;
export type SellerStatus = (typeof SellerStatus)[keyof typeof SellerStatus];

export const NotificationType = {
  ORDER_UPDATE: "ORDER_UPDATE",
  MESSAGE: "MESSAGE",
  SYSTEM: "SYSTEM",
  WARRANTY: "WARRANTY",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const BlockchainTxKind = {
  PRODUCT_REGISTRATION: "PRODUCT_REGISTRATION",
  WARRANTY_MINT: "WARRANTY_MINT",
  PAYMENT: "PAYMENT",
} as const;
export type BlockchainTxKind =
  (typeof BlockchainTxKind)[keyof typeof BlockchainTxKind];
