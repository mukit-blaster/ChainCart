"use client";

import { BrowserProvider } from "ethers";
import { api } from "./api";
import { useAuthStore } from "@/stores/auth";
import { useWalletStore } from "@/stores/wallet";

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider & {
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export const hasMetaMask = () =>
  typeof window !== "undefined" && Boolean(window.ethereum);

export const connectWallet = async () => {
  if (!hasMetaMask()) throw new Error("MetaMask not detected");
  const provider = new BrowserProvider(window.ethereum!);
  const signer = await provider.getSigner();
  const address = (await signer.getAddress()).toLowerCase();
  const network = await provider.getNetwork();

  useWalletStore.setState({
    address,
    chainId: Number(network.chainId),
  });

  return { address, chainId: Number(network.chainId), signer };
};

// SIWE-style flow: get a nonce from the API, sign it, exchange for tokens.
export const walletLogin = async () => {
  useWalletStore.setState({ connecting: true });
  try {
    const { address, signer } = await connectWallet();
    const { data: nonceResp } = await api.post("/auth/wallet/nonce", { address });
    const signature = await signer.signMessage(nonceResp.nonce);
    const { data } = await api.post("/auth/wallet/login", {
      address,
      signature,
      nonce: nonceResp.nonce,
    });
    useAuthStore.getState().setSession(data);
    return data;
  } finally {
    useWalletStore.setState({ connecting: false });
  }
};
