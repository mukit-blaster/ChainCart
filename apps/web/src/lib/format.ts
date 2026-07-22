export const fmtUSD = (cents: number) =>
  "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtETH = (cents: number) => ((cents / 100) / 2600).toFixed(4) + " ETH";

export const shortHash = (h?: string | null) =>
  h ? `${h.slice(0, 6)}…${h.slice(-4)}` : "";

export const shortAddress = shortHash;
