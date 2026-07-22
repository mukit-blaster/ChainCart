"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="cc-hero-bg min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="cc-eyebrow mb-2 text-danger">Error</div>
      <h1 className="cc-h1 mb-3">Something went wrong</h1>
      <p className="text-fg2 mb-6 max-w-sm">
        We caught an unexpected error. Try again or head back to the homepage.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="brand" size="lg" className="rounded-full">
          Try again
        </Button>
        <Button asChild variant="ghost" size="lg" className="rounded-full">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
