import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} from "./enums";

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  walletAddress: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
}

export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  discountPct: number;
  rating: number;
  reviewCount: number;
  stock: number;
  category: { id: string; name: string; slug: string } | null;
  seller: { id: string; displayName: string };
  primaryImage: ProductImage | null;
  isVerified: boolean;
  hasNFTWarranty: boolean;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  sku: string;
  images: ProductImage[];
  blockchainHash: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CartLine {
  productId: string;
  quantity: number;
  product?: ProductSummary;
}

export interface OrderLine {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  lines: OrderLine[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachmentUrl: string | null;
  createdAt: string;
}
