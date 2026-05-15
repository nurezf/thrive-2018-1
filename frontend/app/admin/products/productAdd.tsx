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
import { z } from "zod";

type Category = {
  category_id: string;
  name: string;
};

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than 0"),
  originalPrice: z
    .number()
    .positive("Original price must be greater than 0")
    .optional(),
  discountPercentage: z
    .number()
    .positive("Discount percentage must be greater than 0")
    .optional(),
  stock: z.number().positive("Stock must be greater than 0"),
  image: z.instanceof(File, "Image is required"),
  categoryId: z.string().min(1, "Category is required"),
});

export default function ProductAdd() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
  const [discountPercentage, setDiscountPercentage] = useState<number | "">("");
  const [stock, setStock] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

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
      const response = await axios.post("http://localhost:8000/api/product", {
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
      const newProduct = response.data;

      if (image && newProduct.product_id) {
        const formData = new FormData();
        formData.append("images", image);
        // Note: we're bypassing user auth middleware for development
        try {
          await axios.post(
            `http://localhost:8000/api/product/${newProduct.product_id}/images`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer dev_token",
              },
            },
          );
        } catch (imgError: any) {
          console.error(
            "Image upload failed:",
            imgError.response?.data || imgError,
          );
          alert(
            `Product created, but image upload failed: ${imgError.response?.data?.details || imgError.message}`,
          );
          window.location.reload();
          return;
        }
      }
      alert("Product added successfully!");
      window.location.reload();
    } catch (error: any) {
      console.error("Error creating product:", error.response?.data || error);
      alert(
        `Failed to add product: ${error.response?.data?.error || error.message}`,
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Add Product
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>Add a new product to the store.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                description
              </Label>
              <Input
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                price
              </Label>
              <Input
                id="price"
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
                onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                stock
              </Label>
              <Input
                id="stock"
                type="number"
                onChange={(e) => setStock(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                image
              </Label>
              <Input
                id="image"
                type="file"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                categories
              </Label>
              <Select onValueChange={(value: string) => setCategoryId(value)}>
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
          Add Product
        </Button>
      </DialogContent>
    </Dialog>
  );
}
