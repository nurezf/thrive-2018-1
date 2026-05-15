"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Product } from "@/app/admin/products/page";
import { ShoppingCart } from "lucide-react";
import { useProductStore } from "../hooks/useProduct";
import Link from "next/link";

export default function ProductDisplay() {
  const {
    product,
    loading,
    error,
    cart,
    handleAddToCart,
    setProduct,
    setLoading,
    setError,
  } = useProductStore();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/product");
        const data = await response.json();
        setProduct(data);
        console.log(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);
  return (
    <main>
      <header className="flex items-center justify-between gap-2 my-5">
        <h2 className="text-2xl font-semibold">Products</h2>
        {/* TODO: add search bar */}
        <input
          type="text"
          placeholder="Search..."
          className="border border-border rounded-md p-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* TODO: add category filter */}
        <select name="" id="" className="border border-border rounded-md p-2">
          <option value="">all</option>
          <option value="">Electronics</option>
          <option value="">Books</option>
          <option value="">Clothing</option>
          <option value="">Home & Kitchen</option>
          <option value="">Sports & Fitness</option>
          <option value="">Toys & Games</option>
          <option value="">Beauty & Personal Care</option>
          <option value="">Health & Household</option>
          <option value="">Pet Supplies</option>
          <option value="">Automotive</option>
          <option value="">Tools & Home Improvement</option>
          <option value="">Grocery & Gourmet Foods</option>
        </select>
        {/* TODO: cart icon */}
        <Button className="relative">
          <ShoppingCart />
          <p className="absolute top-0 right-0 text-red-500">{cart.length}</p>
        </Button>
        <Button>
          <Link href="/checkout">checkout</Link>
        </Button>
      </header>
      <section className="grid grid-cols-4 gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : product ? (
          <>
            {product
              .filter(
                (p: Product) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (p.description &&
                    p.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())),
              )
              .map((p: Product) => (
                <Card
                  key={p.product_id}
                  className="overflow-hidden flex flex-col"
                >
                  {p.images && p.images.length > 0 && (
                    <div className="w-full h-48 bg-muted relative">
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                    <CardDescription>{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-lg">${p.price}</p>
                      {p.original_price && (
                        <p className="line-through text-muted-foreground text-sm">
                          ${p.original_price}
                        </p>
                      )}
                    </div>
                    {p.discount_percentage && (
                      <p className="text-green-600 font-medium text-sm">
                        {p.discount_percentage}% OFF
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <CardAction>
                      <Button
                        onClick={() => handleAddToCart(p)}
                        className="w-full bg-blue-500 text-blue-50"
                      >
                        Add to Cart
                      </Button>
                    </CardAction>
                  </CardFooter>
                </Card>
              ))}
          </>
        ) : (
          <p>No products found</p>
        )}
      </section>
    </main>
  );
}
