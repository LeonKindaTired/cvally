import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { useAuth } from "@/context/authContext";

interface PricingCardProps {
  product: {
    name: string;
    price_formatted: string;
    description: string;
    variant_id?: string;
    product_id?: string;
    test_mode: boolean;
  };
}

export function PricingCard({ product }: PricingCardProps) {
  const [isPending, setIsPending] = useState(false);
  const { session } = useAuth();

  const formatProductName = (name: string) => {
    return name
      .replace("subscription_", "")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const parseDescription = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const onSubscribe = async () => {
    if (!product.variant_id) return;

    setIsPending(true);
    try {
      const res = await fetch("http://localhost:5000/api/lemon/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: product.variant_id,
          userId: session?.user.id,
          email: session?.user.email,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-2xl">
            {formatProductName(product.name)}
          </CardTitle>
          {product.test_mode && (
            <Badge variant="secondary" className="text-xs">
              Test Mode
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="text-3xl font-bold">{product.price_formatted}</div>
        <CardDescription className="text-base">
          {parseDescription(product.description)}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={onSubscribe}
          disabled={isPending || !product.variant_id}
        >
          {isPending ? "Processing..." : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  );
}
