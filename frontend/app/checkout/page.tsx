"use client";
import { useProductStore } from "../hooks/useProduct";
import { useState, useEffect } from "react";
import { Product } from "../admin/products/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";

export default function CheckoutPage() {
  const { cart } = useProductStore();
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  async function calculateTotalPrice() {
    const total = cart.reduce((acc, product) => acc + Number(product.price), 0);
    setTotalPrice(total);
  }

  useEffect(() => {
    async function calculateTotalPrice() {
      const total = cart.reduce(
        (acc, product) => acc + Number(product.price),
        0,
      );
      setTotalPrice(total);
    }
    calculateTotalPrice();
  }, []);

  function handleRemoveFromCart(product: Product) {
    const newCart = cart.filter(
      (item) => item.product_id !== product.product_id,
    );
    useProductStore.setState({ cart: newCart });
  }

  async function handleCheckout() {
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      // Group quantities
      const productsPayload = cart.reduce((acc: any[], product) => {
        const existing = acc.find((p) => p.product_id === product.product_id);
        if (existing) {
          existing.quantity += 1;
        } else {
          acc.push({
            product_id: product.product_id,
            quantity: 1,
            discount_percentage: Number(product.discount_percentage || 0),
          });
        }
        return acc;
      }, []);

      const response = await axios.post(
        "http://localhost:8000/api/sales/create",
        {
          products: productsPayload,
          payment_method: paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      if (response.data?.message?.includes("pending manager approval")) {
        setIsPolling(true);
        const salesId = response.data.sales_id;
        
        const pollInterval = setInterval(async () => {
          try {
            const checkRes = await axios.get(
              `http://localhost:8000/api/sales/${salesId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              }
            );
            const status = checkRes.data.payment?.status;
            
            if (status === "completed") {
              clearInterval(pollInterval);
              setIsPolling(false);
              setIsCheckingOut(false);
              alert("Sale approved and completed successfully!");
              useProductStore.setState({ cart: [] });
              setIsDialogOpen(false);
            } else if (status === "failed") {
              clearInterval(pollInterval);
              setIsPolling(false);
              setIsCheckingOut(false);
              alert("Sale was rejected by the manager.");
              setIsDialogOpen(false);
            }
          } catch (e) {
            console.error("Polling error", e);
          }
        }, 3000);
      } else {
        const successMessage = response.data?.message || "Sale created successfully!";
        alert(successMessage);
        useProductStore.setState({ cart: [] });
        setIsDialogOpen(false);
        setIsCheckingOut(false);
      }
    } catch (error: any) {
      console.error("Checkout failed", error);
      alert(
        "Checkout failed: " + (error.response?.data?.error || error.message),
      );
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="flex flex-col gap-4">
      {cart.length === 0 && <p>No items in cart</p>}
      {cart.map((product) => (
        <Card key={product.product_id}>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>price: $ {product.price}</p>
            <p>discount: %{product.discount_percentage}</p>
          </CardContent>
          <CardFooter>
            <CardAction>
              <Button
                className="bg-red-500 hover:bg-red-700 text-white"
                onClick={() => handleRemoveFromCart(product)}
              >
                Remove
              </Button>
            </CardAction>
          </CardFooter>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Total Price</CardTitle>
        </CardHeader>
        <CardContent>
          <p>total: $ {totalPrice.toFixed(2)}</p>
        </CardContent>
        <CardFooter>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={cart.length === 0}>Checkout</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Complete Checkout</DialogTitle>
                <DialogDescription>
                  Choose your payment method to finalize the sale. Total amount:
                  ${totalPrice.toFixed(2)}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {isPolling ? (
                  <div className="flex flex-col items-center justify-center p-4">
                    <p className="text-lg font-medium text-orange-600">Waiting for manager approval...</p>
                    <p className="text-sm text-gray-500">Please do not close this window.</p>
                  </div>
                ) : (
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank">Bank Transfer</Label>
                    </div>
                  </RadioGroup>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isPolling}
                >
                  Cancel
                </Button>
                <Button onClick={handleCheckout} disabled={isCheckingOut || isPolling}>
                  {isCheckingOut ? "Processing..." : "Confirm Payment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </main>
  );
}
