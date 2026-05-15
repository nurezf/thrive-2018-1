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
import { Download, FileText, Search, BarChart3 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import SalesDialog from "@/app/admin/sales/salesDialog.tsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ProductQuantity {
  id: string;
  quantity: number;
  product?: {
    name: string;
    price: number;
  };
}

interface Sale {
  sales_id: string;
  sale_date: string;
  user_id?: string;
  users?: {
    name: string;
  };
  payment?: {
    method: string;
    amount: number;
    status: string;
  };
  sales_product_quantities?: ProductQuantity[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [filterType, setFilterType] = useState<"all" | "daily" | "monthly">(
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      const productsString =
        sale.sales_product_quantities
          ?.map((i: ProductQuantity) => `${i.product?.name} (x${i.quantity})`)
          .join(", ") || "No products";
      return {
        "Transaction ID": sale.sales_id,
        "Customer Name":
          sale.users?.name || sale.user_id?.slice(0, 8) || "Guest",
        Date: new Date(sale.sale_date).toLocaleString(),
        Products: productsString,
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
      sale.sales_product_quantities
        ?.map((i: ProductQuantity) => `${i.product?.name} (x${i.quantity})`)
        .join(", ") || "No products",
      sale.payment?.method || "Unknown",
      `$${Number(sale.payment?.amount || 0).toFixed(2)}`,
    ]);

    // @ts-expect-error - jsPDF autoTable types
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

  const chartData = React.useMemo(() => {
    const paymentMethods: Record<string, number> = {};
    const dailySales: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      const method = sale.payment?.method || "Unknown";
      paymentMethods[method] =
        (paymentMethods[method] || 0) + Number(sale.payment?.amount || 0);

      const date = new Date(sale.sale_date).toLocaleDateString();
      dailySales[date] =
        (dailySales[date] || 0) + Number(sale.payment?.amount || 0);
    });

    const pieData = Object.entries(paymentMethods).map(([method, amount]) => ({
      name: method,
      value: amount,
    }));

    const barData = Object.entries(dailySales)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, amount]) => ({
        date,
        amount,
      }));

    return { pieData, barData };
  }, [filteredSales]);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Analytics</h2>
          <p className="text-muted-foreground">
            Monitor your sales performance and trends.
          </p>
        </div>
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredSales.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {filteredSales.length > 0
                ? (totalRevenue / filteredSales.length).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredSales.filter((s) => s.payment?.status === "completed")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Successful transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                filteredSales.filter((s) => s.payment?.status === "pending")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting manager approval
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${index * 45}, 70%, 50%)`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toFixed(2)}`,
                    "Revenue",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `$${Number(value).toFixed(2)}`,
                    "Revenue",
                  ]}
                />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Transactions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailed view of all sales records
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All Time
              </Button>
              <Button
                variant={filterType === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("daily")}
              >
                Today
              </Button>
              <Button
                variant={filterType === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("monthly")}
              >
                This Month
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Loading sales data...
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
                        {sale.users?.name ||
                          sale.user_id?.slice(0, 8) ||
                          "Guest"}
                      </TableCell>
                      <TableCell>
                        {new Date(sale.sale_date).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {sale.sales_product_quantities &&
                        sale.sales_product_quantities.length > 0 ? (
                          <div className="max-w-xs">
                            <ul className="list-disc pl-4 text-xs space-y-1">
                              {sale.sales_product_quantities
                                .slice(0, 2)
                                .map((item: ProductQuantity) => (
                                  <li key={item.id} className="truncate">
                                    {item.product?.name || "Unknown Product"} (x
                                    {item.quantity})
                                  </li>
                                ))}
                              {sale.sales_product_quantities.length > 2 && (
                                <li className="text-muted-foreground">
                                  +{sale.sales_product_quantities.length - 2}{" "}
                                  more
                                </li>
                              )}
                            </ul>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            No products
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">
                        {sale.payment?.method || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            sale.payment?.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : sale.payment?.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {sale.payment?.status || "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${Number(sale.payment?.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <SalesDialog saleId={sale.sales_id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
