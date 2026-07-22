// Lightweight ethers wrapper for the two ChainCart contracts. We intentionally
// inline a minimal ABI rather than importing from packages/contracts so the
// API doesn't have to wait on a Hardhat compile during deploy. If you change
// a function signature in the .sol files, sync it here too.

import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { env } from "../config/env";
import { logger } from "../config/logger";

const PRODUCT_REGISTRY_ABI = [
  "function registerProduct(bytes32 hash) external",
  "function verify(bytes32 hash) external view returns (bool registered, address seller, uint64 registeredAt)",
  "event ProductRegistered(bytes32 indexed hash, address indexed seller)",
];

const WARRANTY_NFT_ABI = [
  "function mintWarranty(address to, bytes32 productHash, bytes32 orderRef, uint64 validUntil, string calldata uri) external returns (uint256)",
  "function isValid(uint256 tokenId) external view returns (bool)",
  "event WarrantyMinted(uint256 indexed tokenId, address indexed owner, bytes32 productHash, bytes32 orderRef, uint64 validUntil)",
];

interface OnChain {
  provider: JsonRpcProvider;
  signer: Wallet;
  registry: Contract | null;
  warranty: Contract | null;
}

let cached: OnChain | null = null;

// Returns null when on-chain config is missing — callers fall back to the
// existing simulation path so dev/test environments keep working.
export const getOnChain = (): OnChain | null => {
  if (cached) return cached;
  if (!env.RPC_URL || !env.DEPLOYER_PRIVATE_KEY) return null;

  try {
    const provider = new JsonRpcProvider(env.RPC_URL);
    const signer = new Wallet(env.DEPLOYER_PRIVATE_KEY, provider);

    cached = {
      provider,
      signer,
      registry: env.PRODUCT_REGISTRY_ADDRESS
        ? new Contract(env.PRODUCT_REGISTRY_ADDRESS, PRODUCT_REGISTRY_ABI, signer)
        : null,
      warranty: env.WARRANTY_NFT_ADDRESS
        ? new Contract(env.WARRANTY_NFT_ADDRESS, WARRANTY_NFT_ABI, signer)
        : null,
    };
    return cached;
  } catch (err) {
    logger.warn({ err }, "Failed to initialize on-chain client");
    return null;
  }
};

export const networkLabel = () =>
  env.CHAIN_ID ? `chain-${env.CHAIN_ID}` : "local";
