"use client";

import {
  Card,
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
import { toast } from "sonner";
import Image from "next/image";

export default function ProductDisplay() {
  const {
    product,
    loading,
    error,
    cart,
    handleAddToCart,
    setProduct,
    setLoading,
  } = useProductStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredProducts = product
    ? product.filter((p: Product) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description &&
            p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory =
          selectedCategory === "" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

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
  }, [setProduct, setLoading]);

  return (
    <main className="mx-auto max-w-7xl p-4">
      <div className="mb-8 rounded-3xl border border-border bg-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Shop
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover our collection of quality products.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="relative">
              <ShoppingCart className="size-4" />
              <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {cart.length}
              </span>
            </Button>
            <Button>
              <Link href="/checkout">Checkout</Link>
            </Button>
            <Button variant="outline">
              <Link href="/admin/dashboard">Admin Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="rounded-full border border-border bg-background px-4 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Sports & Fitness">Sports & Fitness</option>
            <option value="Toys & Games">Toys & Games</option>
            <option value="Beauty & Personal Care">
              Beauty & Personal Care
            </option>
            <option value="Health & Household">Health & Household</option>
            <option value="Pet Supplies">Pet Supplies</option>
            <option value="Automotive">Automotive</option>
            <option value="Tools & Home Improvement">
              Tools & Home Improvement
            </option>
            <option value="Grocery & Gourmet Foods">
              Grocery & Gourmet Foods
            </option>
          </select>
        </div>
      </div>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : error ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <p className="text-destructive">Error: {error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <p className="text-muted-foreground">No products found.</p>
          </div>
        ) : (
          filteredProducts.map((p: Product) => (
            <Card
              key={p.product_id}
              className="group overflow-hidden border-border transition-all hover:shadow-lg"
            >
              {p.images && p.images.length > 0 ? (
                <div className="aspect-square overflow-hidden bg-muted">
                  <Image
                    src={p.images[0]?.url}
                    alt={p.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No image</p>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2 text-lg">{p.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {p.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">${p.price}</p>
                  {p.original_price && (
                    <p className="text-sm text-muted-foreground line-through">
                      ${p.original_price}
                    </p>
                  )}
                </div>
                {p.discount_percentage && (
                  <p className="mt-1 text-sm font-medium text-green-600">
                    {p.discount_percentage}% OFF
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => {
                    handleAddToCart(p);
                    toast.success(`${p.name} added to cart!`);
                  }}
                  className="w-full"
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
