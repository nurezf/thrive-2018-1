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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Check, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ApprovalsPage() {
  const [pendingSales, setPendingSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingSales = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:8000/api/sales", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pending = response.data.filter(
          (sale: any) => sale.payment?.status === "pending",
        );
        setPendingSales(pending);
      } catch (error) {
        console.error("Failed to fetch pending sales", error);
        toast.error("Failed to load approvals");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingSales();
  }, []);

  const handleAction = async (
    salesId: string,
    action: "approve" | "reject",
  ) => {
    try {
      setProcessingId(salesId);
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        `http://localhost:8000/api/sales/${salesId}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(response.data.message);
      // Remove the processed sale from the list
      setPendingSales((prev) =>
        prev.filter((sale) => sale.sales_id !== salesId),
      );
    } catch (error: any) {
      console.error(`Failed to ${action} sale`, error);
      toast.error(error.response?.data?.error || `Failed to ${action} sale`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manager Approvals
          </h2>
          <p className="text-muted-foreground">
            Review and approve high-value transactions.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Sales</CardTitle>
          <CardDescription>
            Orders over 50,000 awaiting your authorization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading pending approvals...
                    </TableCell>
                  </TableRow>
                ) : pendingSales.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center py-6 gap-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                        No pending approvals found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingSales.map((sale) => (
                    <TableRow key={sale.sales_id}>
                      <TableCell className="font-mono text-xs">
                        {sale.sales_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sale.users?.name ||
                          sale.user_id?.slice(0, 8) ||
                          "Guest"}
                      </TableCell>
                      <TableCell>
                        {new Date(sale.sale_date).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold text-amber-600">
                        ${Number(sale.payment?.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-200 hover:bg-green-400 text-black"
                            disabled={processingId === sale.sales_id}
                            onClick={() =>
                              handleAction(sale.sales_id, "approve")
                            }
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={processingId === sale.sales_id}
                            onClick={() =>
                              handleAction(sale.sales_id, "reject")
                            }
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
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
