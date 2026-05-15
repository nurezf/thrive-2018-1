"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@base-ui/react";
import axios from "axios";
import { Product } from "./page";

type Category = {
  category_id: string;
  name: string;
};

interface ProductEditProps {
  product: Product;
}

export default function ProductEdit({ product }: ProductEditProps) {
  const [name, setName] = useState(product.name || "");
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(Number(product.price) || 0);
  const [originalPrice, setOriginalPrice] = useState<number | "">(
    product.original_price ? Number(product.original_price) : ""
  );
  const [discountPercentage, setDiscountPercentage] = useState<number | "">(
    product.discount_percentage ? Number(product.discount_percentage) : ""
  );
  const [stock, setStock] = useState(product.stock || 0);
  const [categoryId, setCategoryId] = useState<string>(product.category_id || "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch("http://localhost:8000/api/categories");
      const data = await response.json();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/product/${product.product_id}`, {
        name,
        description,
        price,
        original_price: originalPrice ? Number(originalPrice) : null,
        discount_percentage: discountPercentage
          ? Number(discountPercentage)
          : null,
        stock,
        category_id: categoryId,
      });

      alert("Product updated successfully!");
      setIsOpen(false);
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating product:", error.response?.data || error);
      alert(`Failed to update product: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
        Edit
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="originalPrice"
                className="text-right whitespace-nowrap overflow-hidden text-ellipsis"
              >
                Original Price
              </Label>
              <Input
                id="originalPrice"
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="discountPercentage"
                className="text-right whitespace-nowrap overflow-hidden text-ellipsis"
              >
                Discount %
              </Label>
              <Input
                id="discountPercentage"
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={categoryId} onValueChange={(value: string) => setCategoryId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
        <Button type="submit" onClick={handleSubmit}>
          Save Changes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
