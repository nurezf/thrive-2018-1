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
import CategoryAdd from "./addCategoris";

type Category = {
  category_id: string;
  name: string;
  description: string;
};

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then((data) => setCategories(data));
  }, []);

  return (
    <>
      <div className="flex flex-1 items-center gap-4 px-6">
        <h1 className="text-lg font-semibold">Categories</h1>
        <Button variant="outline" size="sm">
          <CategoryAdd />
        </Button>
      </div>

      <Table>
        <TableCaption>A list of recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.category_id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
