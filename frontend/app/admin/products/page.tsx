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
import ProductEdit from "./productEdit";
import axios from "axios";
import { Download, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

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

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:8000/api/product/${productId}`);
        setProducts(products.filter((p) => p.product_id !== productId));
        alert("Product deleted successfully");
      } catch (error) {
        console.error("Failed to delete product", error);
        alert("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.sku &&
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const exportToExcel = () => {
    const wsData = filteredProducts.map((product) => ({
      "SKU": product.sku,
      "Name": product.name,
      "Category": categories.find((c) => c.category_id === product.category_id)?.name || "N/A",
      "Price ($)": Number(product.price).toFixed(2),
      "Stock": product.stock,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Report");
    XLSX.writeFile(wb, "Stock_Report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Stock Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Products: ${filteredProducts.length}`, 14, 36);

    const tableColumn = ["SKU", "Name", "Category", "Price", "Stock"];
    const tableRows = filteredProducts.map((product) => [
      product.sku,
      product.name,
      categories.find((c) => c.category_id === product.category_id)?.name || "N/A",
      `$${Number(product.price).toFixed(2)}`,
      product.stock,
    ]);

    // @ts-ignore
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("Stock_Report.pdf");
  };

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
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product, index) => (
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
              <TableCell className="flex items-center gap-2">
                <ProductEdit product={product} />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.product_id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
