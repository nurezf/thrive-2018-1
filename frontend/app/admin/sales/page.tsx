"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Search } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<"all" | "daily" | "monthly">(
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8000/api/sales", {
        headers: { Authorization: "Bearer dev_token" },
      });
      setSales(response.data);
      setFilteredSales(response.data);
    } catch (error) {
      console.error("Failed to fetch sales", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:8000/api/sales", {
          headers: { Authorization: "Bearer dev_token" },
        });
        setSales(response.data);
        setFilteredSales(response.data);
      } catch (error) {
        console.error("Failed to fetch sales", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let result = [...sales];

      // Date filtering
      const now = new Date();
      if (filterType === "daily") {
        result = result.filter((sale) => {
          const saleDate = new Date(sale.sale_date);
          return saleDate.toDateString() === now.toDateString();
        });
      } else if (filterType === "monthly") {
        result = result.filter((sale) => {
          const saleDate = new Date(sale.sale_date);
          return (
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear()
          );
        });
      }

      // Search filtering
      if (searchTerm) {
        result = result.filter(
          (sale) =>
            sale.users?.name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            sale.payment?.method
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            sale.sales_id.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      setFilteredSales(result);
    };

    applyFilters();
  }, [filterType, sales, searchTerm]);

  const totalRevenue = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.payment?.amount || 0),
    0,
  );

  const exportToExcel = () => {
    const wsData = filteredSales.map((sale) => {
      const productsString = sale.sales_product_quantities?.map((i: any) => `${i.product?.name} (x${i.quantity})`).join(", ") || "No products";
      return {
        "Transaction ID": sale.sales_id,
        "Customer Name": sale.users?.name || sale.user_id?.slice(0, 8) || "Guest",
        Date: new Date(sale.sale_date).toLocaleString(),
        "Products": productsString,
        "Payment Method": sale.payment?.method || "Unknown",
        "Amount ($)": Number(sale.payment?.amount || 0).toFixed(2),
        Status: sale.payment?.status || "Unknown",
      };
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `Sales_Report_${filterType}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text(`Sales Report - ${filterType.toUpperCase()}`, 14, 22);

    // Add Meta
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Records: ${filteredSales.length}`, 14, 36);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 42);

    const tableColumn = [
      "Transaction ID",
      "Customer",
      "Date",
      "Products",
      "Method",
      "Amount",
    ];
    const tableRows = filteredSales.map((sale) => [
      sale.sales_id.slice(0, 8) + "...",
      sale.users?.name || "Guest",
      new Date(sale.sale_date).toLocaleDateString(),
      sale.sales_product_quantities?.map((i: any) => `${i.product?.name} (x${i.quantity})`).join(", ") || "No products",
      sale.payment?.method || "Unknown",
      `$${Number(sale.payment?.amount || 0).toFixed(2)}`,
    ]);

    // @ts-ignore
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`Sales_Report_${filterType}.pdf`);
  };

  const downloadReceipt = (sale: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Sales Receipt", 14, 22);
    doc.setFontSize(11);
    doc.text(`Transaction ID: ${sale.sales_id}`, 14, 32);
    doc.text(`Date: ${new Date(sale.sale_date).toLocaleString()}`, 14, 38);
    doc.text(`Customer: ${sale.users?.name || sale.user_id?.slice(0, 8) || "Guest"}`, 14, 44);
    doc.text(`Payment Method: ${sale.payment?.method || "Unknown"}`, 14, 50);
    doc.text(`Status: ${sale.payment?.status || "Unknown"}`, 14, 56);

    const productsData = sale.sales_product_quantities?.map((item: any) => [
      item.product?.name || "Unknown Product",
      item.quantity,
      `$${Number(item.product?.price || 0).toFixed(2)}`,
      `$${(item.quantity * Number(item.product?.price || 0)).toFixed(2)}`
    ]) || [];

    // @ts-ignore
    doc.autoTable({
      startY: 65,
      head: [["Product", "Quantity", "Unit Price", "Total"]],
      body: productsData,
      theme: "grid",
    });

    const finalY = (doc as any).lastAutoTable.finalY || 65;
    doc.setFontSize(12);
    doc.text(`Total Amount paid: $${Number(sale.payment?.amount || 0).toFixed(2)}`, 14, finalY + 10);
    
    doc.save(`Receipt_${sale.sales_id.slice(0, 8)}.pdf`);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Sales History</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Filtered Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Based on current filters
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Filtered Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
            <p className="text-xs text-muted-foreground">Sales in this view</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
          >
            All Time
          </Button>
          <Button
            variant={filterType === "daily" ? "default" : "outline"}
            onClick={() => setFilterType("daily")}
          >
            Today
          </Button>
          <Button
            variant={filterType === "monthly" ? "default" : "outline"}
            onClick={() => setFilterType("monthly")}
          >
            This Month
          </Button>
        </div>
        <div className="flex items-center w-full max-w-sm space-x-2 relative">
          <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
          <Input
            placeholder="Search by customer or method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredSales.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No sales found for the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.sales_id}>
                  <TableCell className="font-mono text-xs">
                    {sale.sales_id.slice(0, 13)}...
                  </TableCell>
                  <TableCell className="font-medium">
                    {sale.users?.name || sale.user_id?.slice(0, 8) || "Guest"}
                  </TableCell>
                  <TableCell>
                    {new Date(sale.sale_date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {sale.sales_product_quantities && sale.sales_product_quantities.length > 0 ? (
                      <ul className="list-disc pl-4 text-xs">
                        {sale.sales_product_quantities.map((item: any) => (
                          <li key={item.id}>
                            {item.product?.name || 'Unknown Product'} (x{item.quantity})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground text-xs">No products</span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">
                    {sale.payment?.method || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        sale.payment?.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : sale.payment?.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {sale.payment?.status || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(sale.payment?.amount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => downloadReceipt(sale)} title="Download Receipt">
                      <Download className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
