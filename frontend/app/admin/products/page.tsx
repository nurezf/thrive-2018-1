//tabular view of products
"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ProductAdd from "./productAdd";

export type Product = {
  product_id: string;
  name: string;
  description: string;
  price: string;
  original_price: string;
  discount_percentage: string;
  stock: number;
  category_id: string;
  sku: string;
  images?: { url: string }[];
  created_at: string;
  updated_at: string;
};

type Category = {
  category_id: string;
  name: string;
};

async function getProducts() {
  try {
    const response = await fetch("http://localhost:8000/api/product");
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}


async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:8000/api/categories");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getProducts().then((data) => setProducts(data));
    fetchCategories().then((data) => setCategories(data));
  }, []);

  return (
    <>
      <div className="flex flex-1 items-center justify-between px-6 mb-4 mt-4">
        <h1 className="text-lg font-semibold">Products</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search products..."
            className="border border-border rounded-md p-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ProductAdd />
        </div>
      </div>

      <Table>
        <TableCaption>A list of recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Discount Percentage</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products
            .filter(
              (product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description &&
                  product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (product.sku &&
                  product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map((product, index) => (
            <TableRow key={product.product_id}>
              <TableCell>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-[10px] text-muted-foreground text-center">
                    No img
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>{product.discount_percentage}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {categories.find((c) => c.category_id === product.category_id)?.name || "N/A"}
              </TableCell>
              <TableCell>{product.sku}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
