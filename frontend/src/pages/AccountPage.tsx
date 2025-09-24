import { useEffect, useState } from "react";
import { PricingCard } from "../components/PricingCard";

export default function AccountPage() {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/lemon/products");
        const data = await res.json();
        console.log("API Response:", data);

        if (data.length > 0) {
          setProduct({
            name: data[0].name,
            price_formatted: "$" + (data[0].price / 100).toFixed(2),
            description: data[0].description || "",
            variant_id: data[0].variant_id, // This should now be defined
            test_mode: data[0].test_mode,
          });
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>No products found</div>;

  return <PricingCard product={product} />;
}
