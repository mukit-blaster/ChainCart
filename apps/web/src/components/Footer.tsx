import { Logo } from "./Logo";

const groups = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Marketplace" },
      { href: "/categories", label: "Categories" },
      { href: "/verify", label: "Authenticity" },
    ],
  },
  {
    title: "Sellers",
    links: [
      { href: "/seller", label: "Seller Dashboard" },
      { href: "/register?role=seller", label: "Become a seller" },
    ],
  },
  {
    title: "Web3",
    links: [
      { href: "/wallet", label: "Wallet" },
      { href: "/blockchain", label: "Activity" },
    ],
  },
];

export const Footer = () => (
  <footer className="mt-24 border-t border-border">
    <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
      <div className="col-span-2">
        <Logo />
        <p className="mt-4 text-sm text-fg2 max-w-sm">
          A modern Web3 marketplace. Verified authenticity, NFT-backed warranties, and
          a delightful checkout — all in one place.
        </p>
      </div>
      {groups.map((g) => (
        <div key={g.title}>
          <div className="cc-eyebrow mb-3">{g.title}</div>
          <ul className="space-y-2 text-sm">
            {g.links.map((l) => (
              <li key={l.href}>
                <a className="text-fg2 hover:text-fg" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-border py-5 text-center text-xs text-muted">
      © {new Date().getFullYear()} ChainCart. All rights reserved.
    </div>
  </footer>
);
