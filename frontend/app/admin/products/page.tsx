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

  useEffect(() => {
    getProducts().then((data) => setProducts(data));
    fetchCategories().then((data) => setCategories(data));
  }, []);

  return (
    <>
      <div className="flex flex-1 items-center gap-4 px-6">
        <h1 className="text-lg font-semibold">Products</h1>
        <Button variant="outline" size="sm">
          <ProductAdd />
        </Button>
      </div>

      <Table>
        <TableCaption>A list of recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Original Price</TableHead>
            <TableHead>Discount Percentage</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.product_id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>{product.original_price}</TableCell>
              <TableCell>{product.discount_percentage}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {
                  categories.filter(
                    (category) => category.category_id === product.category_id,
                  )[0].name
                }
              </TableCell>
              <TableCell>{product.sku}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
