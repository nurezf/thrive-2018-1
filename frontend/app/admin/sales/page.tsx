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
import { Download, Search, BarChart3 } from "lucide-react";
import * as XLSX from "xlsx";
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
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    completedSales: 0,
    pendingApprovals: 0,
    revenueByPaymentMethod: [] as { name: string; value: number }[],
    dailySalesTrend: [] as { date: string; amount: number }[],
  });

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true);
        const now = new Date();
        let start, end;

        if (filterType === "daily") {
          start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          end = new Date(now.setHours(23, 59, 59, 999)).toISOString();
        } else if (filterType === "monthly") {
          start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          end = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ).toISOString();
        }

        const response = await axios.get("http://localhost:8000/api/sales", {
          params: {
            page,
            limit,
            search: searchTerm || undefined,
            startDate: start,
            endDate: end,
          },
          headers: { Authorization: "Bearer dev_token" },
        });

        const data = response.data;
        setSales(data.sales || []);
        setFilteredSales(data.sales || []);
        setTotalPages(data.totalPages || 1);
        if (data.summary) {
          setSummary(data.summary);
        }
      } catch (error) {
        console.error("Failed to fetch sales", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, [page, limit, filterType, searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filterType, searchTerm, limit]);

  // Local filtering logic removed as it's now handled server-side

  const totalRevenue = summary.totalRevenue;

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


  const chartData = React.useMemo(() => {
    return {
      pieData: summary.revenueByPaymentMethod,
      barData: summary.dailySalesTrend,
    };
  }, [summary]);

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
          {/* <Button variant="outline" onClick={exportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button> */}

          <div className="ml-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Rows:</span>
              <select
                className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-xs"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">{page}</span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
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
              From {summary.totalTransactions} transactions
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
              {summary.totalTransactions > 0
                ? (totalRevenue / summary.totalTransactions).toFixed(2)
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
            <div className="text-2xl font-bold">{summary.completedSales}</div>
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
            <div className="text-2xl font-bold">{summary.pendingApprovals}</div>
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
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {sales.length} of {summary.totalTransactions} transactions
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <select
                  className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-xs"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                >
                  {[10, 20, 50, 100].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  {"<<"}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {"<"}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {">"}
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  {">>"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
