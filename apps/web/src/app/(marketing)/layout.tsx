import { TopNav } from "@/components/TopNav";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cc-hero-bg min-h-screen">
      <TopNav />
      <MobileNav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
