"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/Button";
import { getStripe } from "@/lib/stripe";

interface Props {
  clientSecret: string;
  orderId: string;
}

// The `<Elements>` provider needs the clientSecret on mount, so we render
// this as soon as the API hands us a PaymentIntent.
export const StripeCheckoutForm = ({ clientSecret, orderId }: Props) => {
  const stripePromise = getStripe();
  if (!stripePromise) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "flat",
          variables: {
            colorPrimary: "#2563EB",
            borderRadius: "12px",
            fontFamily: "Inter, ui-sans-serif",
          },
        },
      }}
    >
      <InnerForm orderId={orderId} />
    </Elements>
  );
};

const InnerForm = ({ orderId }: { orderId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      // Stripe redirects here on 3DS challenges; on success it lands at
      // /checkout/success?payment_intent=...&redirect_status=succeeded
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
      },
    });

    // confirmPayment only resolves with an error if the redirect didn't
    // happen (validation, declined card, etc.). On success the browser is
    // already navigating away.
    if (error) {
      toast.error(error.message ?? "Payment failed");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <PaymentElement />
      <Button
        type="submit"
        variant="brand"
        size="lg"
        className="w-full rounded-full"
        disabled={!stripe || !elements || submitting}
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing…
          </>
        ) : (
          "Pay now"
        )}
      </Button>
    </form>
  );
};
