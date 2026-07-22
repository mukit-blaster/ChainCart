import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="cc-hero-bg min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="cc-eyebrow mb-2">404</div>
      <h1 className="cc-h1 mb-3">Page not found</h1>
      <p className="text-fg2 mb-6 max-w-sm">
        The page you're looking for has moved or never existed.
      </p>
      <Button asChild variant="brand" size="lg" className="rounded-full">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
