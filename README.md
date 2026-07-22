# ChainCart

**A Web3-enabled multi-vendor e-commerce marketplace** — verified product authenticity on-chain, NFT-backed warranties, real-time buyer/seller chat, crypto + card checkout, and a polished SaaS-quality UI. Built as a full-stack TypeScript monorepo.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-Hardhat-363636?logo=solidity&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-realtime-black?logo=socket.io&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-payments-635BFF?logo=stripe&logoColor=white)

![ChainCart home page](<Project%20Images/01-home.png>)

## Features

**Marketplace**
- Product catalog with categories, search, and rich product detail pages
- Cart + multi-step checkout with live order summary
- Card (Stripe), crypto, and bKash payment methods

**Web3 & authenticity**
- Every product can be registered on-chain — a SHA-256 hash of its canonical fields is pinned via a `ProductRegistry` smart contract
- Public **Verify** page: check any product's authenticity hash against the chain
- **NFT warranties** (ERC-721) auto-minted to the buyer's wallet on delivery, viewable in the dashboard
- Wallet login via SIWE-style nonce challenge, alongside standard email/password auth

**Realtime**
- Buyer ↔ seller chat over Socket.IO — token-authenticated, presence, typing indicators, delivery acks

**Accounts & dashboards**
- **Customer**: orders with a live tracking timeline, saved items, NFT warranties, wallet
- **Seller**: storefront overview, revenue/conversion stats, product management
- **Admin**: platform-wide overview, user management, fraud monitor, verification logs

**Engineering**
- JWT access + refresh tokens with rotation and reuse (theft) detection
- Role-based access control (`ADMIN` / `SELLER` / `CUSTOMER`)
- Zod validation end-to-end, typed API client, shared types package across web + api
- SQLite for zero-setup local dev, Postgres-native schema for production
- Dockerized full stack (Postgres + Redis + API + Web) with sane dev defaults
- CI on every PR: lint, typecheck, builds, Hardhat contract tests

## Screenshots

<table>
<tr>
<td width="50%"><b>Home</b><br/><img src="Project%20Images/01-home.png" width="100%"/></td>
<td width="50%"><b>Marketplace</b><br/><img src="Project%20Images/02-shop-listing.png" width="100%"/></td>
</tr>
<tr>
<td width="50%"><b>Product detail</b><br/><img src="Project%20Images/03-product-detail.png" width="100%"/></td>
<td width="50%"><b>Authenticity verification</b><br/><img src="Project%20Images/05-verify.png" width="100%"/></td>
</tr>
<tr>
<td width="50%"><b>Customer dashboard</b><br/><img src="Project%20Images/09-customer-dashboard.png" width="100%"/></td>
<td width="50%"><b>Order tracking</b><br/><img src="Project%20Images/23-product-tracking.png" width="100%"/></td>
</tr>
<tr>
<td width="50%"><b>NFT warranties</b><br/><img src="Project%20Images/12-customer-warranties.png" width="100%"/></td>
<td width="50%"><b>Wallet</b><br/><img src="Project%20Images/13-wallet.png" width="100%"/></td>
</tr>
<tr>
<td width="50%"><b>Realtime chat</b><br/><img src="Project%20Images/14-chat.png" width="100%"/></td>
<td width="50%"><b>Cart &amp; checkout</b><br/><img src="Project%20Images/17-checkout.png" width="100%"/></td>
</tr>
<tr>
<td width="50%"><b>Seller dashboard</b><br/><img src="Project%20Images/18-seller-dashboard.png" width="100%"/></td>
<td width="50%"><b>Seller products</b><br/><img src="Project%20Images/19-seller-products.png" width="100%"/></td>
</tr>
<tr>
<td width="50%"><b>Admin overview</b><br/><img src="Project%20Images/20-admin-dashboard.png" width="100%"/></td>
<td width="50%"><b>Admin users</b><br/><img src="Project%20Images/21-admin-users.png" width="100%"/></td>
</tr>
</table>

<details>
<summary>All 23 screenshots</summary>

| | | |
|---|---|---|
| Home | Marketplace | Product detail |
| ![](<Project%20Images/01-home.png>) | ![](<Project%20Images/02-shop-listing.png>) | ![](<Project%20Images/03-product-detail.png>) |
| Categories | Verify | Register |
| ![](<Project%20Images/04-categories.png>) | ![](<Project%20Images/05-verify.png>) | ![](<Project%20Images/06-register.png>) |
| Login | Home (signed in) | Customer dashboard |
| ![](<Project%20Images/07-login.png>) | ![](<Project%20Images/08-customer-after-login.png>) | ![](<Project%20Images/09-customer-dashboard.png>) |
| Orders | Saved items | Warranties |
| ![](<Project%20Images/10-customer-orders.png>) | ![](<Project%20Images/11-customer-saved.png>) | ![](<Project%20Images/12-customer-warranties.png>) |
| Wallet | Chat | Blockchain activity |
| ![](<Project%20Images/13-wallet.png>) | ![](<Project%20Images/14-chat.png>) | ![](<Project%20Images/15-blockchain.png>) |
| Cart | Checkout | Order detail |
| ![](<Project%20Images/16-cart.png>) | ![](<Project%20Images/17-checkout.png>) | ![](<Project%20Images/22-order-detail.png>) |
| Product tracking | Seller dashboard | Seller products |
| ![](<Project%20Images/23-product-tracking.png>) | ![](<Project%20Images/18-seller-dashboard.png>) | ![](<Project%20Images/19-seller-products.png>) |
| Admin overview | Admin users | |
| ![](<Project%20Images/20-admin-dashboard.png>) | ![](<Project%20Images/21-admin-users.png>) | |

</details>

## Architecture

```
                  ┌──────────────────────┐
   Browser ──────▶│    Next.js 15 (web)  │
                  │  App Router · TS     │
                  │  Tailwind · Zustand  │
                  │  TanStack Query      │
                  └─────┬────────────────┘
                        │ HTTPS + Socket.IO
                  ┌─────▼────────────────┐
                  │  Express + TS (api)  │
                  │  JWT (access+refresh)│
                  │  Prisma · Zod        │
                  │  Socket.IO gateway   │
                  └─────┬────────────────┘
            ┌───────────┼─────────────┐
            ▼           ▼             ▼
       PostgreSQL    Redis        Stripe + RPC
       (Prisma)      (presence    (payments,
                      rate limit)  on-chain reads)

  Solidity (Hardhat) ─ ProductRegistry · WarrantyNFT
```

### Tech stack

| Layer      | Stack |
| ---------- | ----- |
| Web        | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Zustand, TanStack Query, Radix primitives, Framer Motion |
| API        | Express, TypeScript, Prisma, Zod, JWT, Socket.IO, Stripe SDK, ethers.js |
| Database   | PostgreSQL (production) / SQLite (local dev) via Prisma |
| Blockchain | Solidity, Hardhat, OpenZeppelin (ERC-721 warranties, product registry) |
| Infra      | Docker Compose, Redis (presence + rate limiting), GitHub Actions CI |

### Repo layout

```
apps/
  web/                Next.js 15 app
  api/                Express + Prisma backend
packages/
  shared/             TS types/enums shared across web + api
  contracts/          Solidity (Hardhat) + tests
docker/               Dockerfiles + docker-compose
.github/workflows/    CI
Project Images/       Screenshots used in this README
```

## Getting started

There are two paths — pick one.

### A. Native (no Docker required)

Uses SQLite for local dev. No Postgres, no Redis, no Docker.

```bash
npm install --workspaces --include-workspace-root
npm --workspace apps/api run prisma:generate
npm --workspace apps/api run prisma:migrate
npm --workspace apps/api run prisma:seed
npm run dev
```

### B. Full Docker stack (Postgres + Redis + API + Web)

Prereqs: **Docker Desktop** (or Docker Engine + Compose v2).

```bash
docker compose -f docker/docker-compose.yml up --build
```

The compose file ships sane dev defaults (random JWT secrets, default Postgres
creds) so it works without any setup. To override anything — Stripe keys, real
JWT secrets, Cloudinary creds — copy `.env.example` to `.env` at the repo root
and edit; both `web` and `api` services pick it up automatically.

The API container automatically swaps to the Postgres-native schema during
build and runs `prisma db push` on first boot to create tables. To seed demo
data:

```bash
docker compose -f docker/docker-compose.yml exec api \
  sh -c "npx tsx apps/api/prisma/seed.ts"
```

Open http://localhost:3000.

**Demo accounts** (password `password123`):

| Role     | Email                       |
| -------- | --------------------------- |
| Admin    | admin@chaincart.dev         |
| Customer | customer@chaincart.dev      |
| Seller   | helix-atelier@chaincart.dev |
| Seller   | forma-studio@chaincart.dev  |

> All secrets in `.env.example` and `docker-compose.yml` are dev-only placeholders. Never reuse them in production — see [Environment variables](#environment-variables).

## Smart contracts

```bash
cd packages/contracts
npm install
npx hardhat node            # local chain on :8545
npx hardhat test
npx hardhat run scripts/deploy.ts --network localhost
```

Set `PRODUCT_REGISTRY_ADDRESS` and `WARRANTY_NFT_ADDRESS` in your `.env` to wire the deployed addresses into the API.

## Authentication

- **JWT access tokens** (15 min default), kept in memory + auto-refreshed.
- **Refresh tokens** stored in DB as SHA-256 hashes, rotated on every refresh, with theft-detection: a reused refresh kills all sessions for that user.
- **Wallet login** via SIWE-style nonce challenge (`/api/auth/wallet/nonce` → sign → `/api/auth/wallet/login`).
- **RBAC**: `requireAuth` + `requireRole("ADMIN")` middleware.

## Realtime chat

`/api/chat` REST + Socket.IO gateway. Token-authenticated handshake, per-conversation rooms, presence, typing indicators, ack-based delivery confirmations.

## Blockchain features

- **Product registry**: SHA-256 hash of canonical product fields; `POST /api/blockchain/products/:id/register` pins it on-chain (or simulates locally).
- **NFT warranties**: minted at order fulfillment; surface in `/dashboard/warranties`.
- **Verify endpoint**: `POST /api/blockchain/verify` is public and checks a hash against our DB + (in production) the `ProductRegistry` contract.

## Payments

- Stripe Payment Intents with webhook signature verification (`/api/payments/stripe/webhook`).
- Crypto payment confirmation (`POST /api/payments/crypto/confirm`) records a tx hash and flips the order to PAID.
- bKash UI placeholder.

## Environment variables

Every environment variable is documented as a placeholder in **`.env.example`** (root) and **`apps/web/.env.example`** — copy them, never commit real secrets. Actual `.env` / `.env.local` files are git-ignored by default. Notes:

- `DEPLOYER_PRIVATE_KEY` in `.env.example` is Hardhat's well-known local test account #0 key (public, used by every local Hardhat node) — not a real secret, and never use it beyond a local chain.
- Rotate `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` to long random values before any real deployment.
- Stripe, Cloudinary, and RPC keys are optional locally — the app runs fully in "simulated" mode without them (see [What's stubbed](#whats-stubbed)).

## Deployment

| Layer      | Suggested host           | Notes |
| ---------- | ------------------------ | ----- |
| Web (Next) | **Vercel**               | Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to the API origin. |
| API        | **Render** or **Fly.io** | Use `docker/Dockerfile.api`. Provide all env vars from `.env.example`. |
| Postgres   | **Supabase** (free)      | Paste connection string into `DATABASE_URL`. Switch schemas first (see below). |
| Redis      | **Upstash** (free tier)  | Optional but recommended for distributed rate-limit + presence. |
| RPC        | **Alchemy / Infura**     | Set `RPC_URL` and `CHAIN_ID`. |

### Switching to Postgres for production

Local dev uses SQLite (no Docker required). For production we ship a fully
Postgres-native schema with real enums, `Json` columns, and case-insensitive
search. Swap to it before deploying:

```bash
cd apps/api
npm run prisma:use:pg          # copies schema.postgres.prisma → schema.prisma
DATABASE_URL=postgresql://... npx prisma migrate deploy
DATABASE_URL=postgresql://... npx tsx prisma/seed.ts   # optional
```

To return to SQLite for local dev: `npm run prisma:use:sqlite`.

### Real Stripe payments

Set `STRIPE_SECRET_KEY` (server) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client).
The checkout page automatically renders `<PaymentElement>` and runs the full
`stripe.confirmPayment` flow with 3DS support; the order stays in `PENDING`
until the webhook flips it to `PAID`. Without those keys, dev orders skip the
card step and go straight to success.

### Real on-chain calls

Set `RPC_URL`, `DEPLOYER_PRIVATE_KEY`, `PRODUCT_REGISTRY_ADDRESS`, and
`WARRANTY_NFT_ADDRESS`. The API will then call `ProductRegistry.registerProduct(hash)`
and `WarrantyNFT.mintWarranty(...)` for real, write the actual tx hash and
block number to the DB, and surface them in `/dashboard/warranties` and
`/blockchain`. Without those env vars, the simulation path keeps the demo
flowing — same UI, fake tx hashes, status `confirmed`.

To deploy the contracts:

```bash
cd packages/contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

CI is in `.github/workflows/ci.yml` — runs lint, typecheck, web/api builds, and Hardhat tests on every PR.

## Scripts

From the repo root:

| Command                       | What it does |
| ------------------------------ | ------------- |
| `npm run dev`                  | Run web + api in parallel |
| `npm run build`                | Build shared, api, web |
| `npm run typecheck`            | TypeScript check across workspaces |
| `npm run lint`                 | Lint web + api |
| `npm run prisma:migrate`       | Run dev migrations |
| `npm run prisma:seed`          | Seed demo data |
| `npm run contracts:test`       | Hardhat tests |
| `npm run docker:up` / `:down`  | Compose stack |

## What's stubbed

A few things are intentionally placeholder-quality so you can drop in your own provider keys:

- Email dispatch for forgot/verify (route returns 202 today).
- Cloudinary upload signing (returns 400 until cloud creds are set).
- Stripe Elements UI on `/checkout` (we mint the PaymentIntent but the real card form needs your `pk_test_*`).
- bKash integration (UI only).
- Warranty mint via real RPC (we simulate the tx hash and DB write so the dashboard demo flows; swap in `ethers.Contract.mintWarranty(...)` when contracts are deployed).

## Roadmap

- **Search**: replace the `ILIKE` product search with **Meilisearch** or **Algolia** once the catalog grows.
- **Background jobs**: introduce **BullMQ** (already on Redis) for warranty minting, email sending, and order state propagation.
- **Analytics**: ship Order/Payment events to **ClickHouse** for first-party dashboards.
- **Multi-tenant payouts**: Stripe Connect for direct seller payouts.
- **Edge runtime**: move `/verify` and `/products` GET handlers to Next.js edge with KV caching for sub-50ms global reads.
- **Observability**: pino logs already structured; pipe to **Loki + Grafana** or **Datadog**.

## License

Internal demo project. Adapt freely.
