import { create } from "zustand";

interface WalletState {
  address: string | null;
  chainId: number | null;
  connecting: boolean;
  setAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setConnecting: (b: boolean) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  chainId: null,
  connecting: false,
  setAddress: (address) => set({ address }),
  setChainId: (chainId) => set({ chainId }),
  setConnecting: (connecting) => set({ connecting }),
}));
