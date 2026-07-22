"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Wallet, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";
import { useCartStore } from "@/stores/cart";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { fmtUSD } from "@/lib/format";
import { cn } from "@/lib/cn";
import { isStripeConfigured } from "@/lib/stripe";

const schema = z.object({
  fullName: z.string().min(2),
  line1: z.string().min(2),
  line2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().length(2),
  phone: z.string().optional(),
});

type Form = z.infer<typeof schema>;

const METHODS = [
  { id: "STRIPE", label: "Card", icon: CreditCard },
  { id: "CRYPTO", label: "Crypto", icon: Wallet },
  { id: "BKASH", label: "bKash", icon: Smartphone },
] as const;

export default function CheckoutPage() {
  const { items, subtotalCents, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("STRIPE");
  const [submitting, setSubmitting] = useState(false);
  // When the Stripe path is taken, we stage the form into "pay" mode and
  // render the PaymentElement with this clientSecret.
  const [intent, setIntent] = useState<{ clientSecret: string; orderId: string } | null>(null);

  const subtotal = subtotalCents();
  const tax = Math.round(subtotal * 0.07);
  const shipping = items.length ? 999 : 0;
  const total = subtotal + tax + shipping;

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { country: "US" },
  });

  const onSubmit = async (form: Form) => {
    if (!user) {
      router.push("/login?next=/checkout");
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      // Push local cart to server so the order can be built from it.
      await Promise.all(
        items.map((i) =>
          api.post("/cart", { productId: i.productId, quantity: i.quantity }),
        ),
      );

      const { data: order } = await api.post("/orders/checkout", {
        paymentMethod: method,
        shippingAddress: form,
      });

      // Stripe path: ask the API for a PaymentIntent, then mount Elements.
      // The order remains PENDING until the Stripe webhook flips it to PAID.
      if (method === "STRIPE" && isStripeConfigured()) {
        const { data } = await api.post("/payments/stripe/intent", {
          orderId: order.id,
        });
        setIntent({ clientSecret: data.clientSecret, orderId: order.id });
        return;
      }

      // Local/dev or non-Stripe rails: take the happy-path success state.
      clear();
      toast.success("Order placed!");
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err) {
      toast.error("Checkout failed");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-20 grid md:grid-cols-3 gap-8">
      <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 space-y-6">
        <h1 className="cc-h1">Checkout</h1>

        <Card className="p-6">
          <div className="cc-eyebrow mb-4">Shipping address</div>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Full name" error={errors.fullName?.message}>
              <Input {...register("fullName")} />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <Input {...register("phone")} />
            </Field>
            <Field className="md:col-span-2" label="Address line 1" error={errors.line1?.message}>
              <Input {...register("line1")} />
            </Field>
            <Field className="md:col-span-2" label="Address line 2">
              <Input {...register("line2")} />
            </Field>
            <Field label="City" error={errors.city?.message}>
              <Input {...register("city")} />
            </Field>
            <Field label="Region / state">
              <Input {...register("region")} />
            </Field>
            <Field label="Postal code" error={errors.postalCode?.message}>
              <Input {...register("postalCode")} />
            </Field>
            <Field label="Country (ISO-2)" error={errors.country?.message}>
              <Input {...register("country")} maxLength={2} />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <div className="cc-eyebrow mb-4">Payment method</div>
          <div className="grid grid-cols-3 gap-3">
            {METHODS.map((m) => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "border rounded-xl p-4 flex flex-col items-center gap-2 transition",
                    active
                      ? "border-brand bg-brand/5 text-brand"
                      : "border-border hover:bg-surface2",
                  )}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-3">
            {method === "STRIPE" &&
              (isStripeConfigured()
                ? "Secure card processing via Stripe."
                : "Stripe is not configured — order will be placed without charging a card (dev mode).")}
            {method === "CRYPTO" && "Pay with ETH from a connected MetaMask wallet."}
            {method === "BKASH" && "bKash mobile payments — coming soon. Demo only."}
          </p>
        </Card>

        {intent && (
          <Card className="p-6">
            <div className="cc-eyebrow mb-4">Card details</div>
            <StripeCheckoutForm clientSecret={intent.clientSecret} orderId={intent.orderId} />
          </Card>
        )}
      </form>

      <Card className="p-5 h-fit sticky top-24">
        <div className="cc-eyebrow mb-3">Order summary</div>
        <div className="space-y-2 text-sm">
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between">
              <span className="truncate pr-3">{i.title} × {i.quantity}</span>
              <span>{fmtUSD(i.priceCents * i.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border my-3" />
        <Row label="Subtotal" value={fmtUSD(subtotal)} />
        <Row label="Tax" value={fmtUSD(tax)} />
        <Row label="Shipping" value={fmtUSD(shipping)} />
        <div className="border-t border-border my-3" />
        <Row label="Total" value={fmtUSD(total)} bold />
        <Button
          variant="brand"
          size="lg"
          className="rounded-full mt-5 w-full"
          disabled={submitting || Boolean(intent)}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          {intent ? "Awaiting payment…" : submitting ? "Placing order…" : "Place order"}
        </Button>
      </Card>
    </div>
  );
}

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className={`flex justify-between py-1 ${bold ? "text-base font-semibold" : "text-sm text-fg2"}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const Field = ({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <label className={cn("block", className)}>
    <span className="text-xs font-medium text-fg2 mb-1.5 block">{label}</span>
    {children}
    {error && <span className="text-[11px] text-danger mt-1 block">{error}</span>}
  </label>
);
