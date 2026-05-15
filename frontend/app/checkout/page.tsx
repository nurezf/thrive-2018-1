"use client";
import { useProductStore } from "../hooks/useProduct";
import { useState, useMemo } from "react";
import { Product } from "../admin/products/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { toast } from "sonner";

export default function CheckoutPage() {
  const { cart } = useProductStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const aggregatedCart = useMemo(() => {
    const map = new Map<string, { product: Product; quantity: number }>();

    cart.forEach((product) => {
      const existing = map.get(product.product_id);
      if (existing) {
        existing.quantity += 1;
      } else {
        map.set(product.product_id, { product, quantity: 1 });
      }
    });

    return Array.from(map.values());
  }, [cart]);

  const totalPrice = useMemo(
    () =>
      aggregatedCart.reduce(
        (acc, item) => acc + Number(item.product.price) * item.quantity,
        0,
      ),
    [aggregatedCart],
  );

  function handleRemoveFromCart(product: Product) {
    const productIndex = cart.findIndex(
      (item) => item.product_id === product.product_id,
    );
    if (productIndex === -1) return;

    const newCart = [...cart];
    newCart.splice(productIndex, 1);
    useProductStore.setState({ cart: newCart });
  }

  function handleIncreaseQuantity(product: Product) {
    useProductStore.setState((state) => ({ cart: [...state.cart, product] }));
  }

  function handleDecreaseQuantity(product: Product) {
    const productIndex = cart.findIndex(
      (item) => item.product_id === product.product_id,
    );
    if (productIndex === -1) return;

    const newCart = [...cart];
    newCart.splice(productIndex, 1);
    useProductStore.setState({ cart: newCart });
  }

  async function handleCheckout() {
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    try {
      // Group quantities
      const productsPayload = cart.reduce(
        (
          acc: Array<{
            product_id: number;
            quantity: number;
            discount_percentage: number;
          }>,
          product,
        ) => {
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
        },
        [],
      );

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
              },
            );
            const status = checkRes.data.payment?.status;

            if (status === "completed") {
              clearInterval(pollInterval);
              setIsPolling(false);
              setIsCheckingOut(false);
              toast.success("Sale approved and completed successfully!");
              useProductStore.setState({ cart: [] });
              setIsDialogOpen(false);
            } else if (status === "failed") {
              clearInterval(pollInterval);
              setIsPolling(false);
              setIsCheckingOut(false);
              toast.error("Sale was rejected by the manager.");
              setIsDialogOpen(false);
            }
          } catch (e) {
            console.error("Polling error", e);
          }
        }, 3000);
      } else {
        const successMessage =
          response.data?.message || "Sale created successfully!";
        toast.success(successMessage);
        useProductStore.setState({ cart: [] });
        setIsDialogOpen(false);
        setIsCheckingOut(false);
      }
    } catch (error: unknown) {
      console.error("Checkout failed", error);

      const message =
        error instanceof Error ? error.message : JSON.stringify(error, null, 2);

      toast.error("Checkout failed: " + message);
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-slate-50 p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Checkout
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Review your cart
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {cart.length} item{cart.length === 1 ? "" : "s"} added to checkout.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Total ${totalPrice.toFixed(2)}
          </span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={cart.length === 0}>Checkout</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
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
                    <p className="text-lg font-medium text-orange-600">
                      Waiting for manager approval...
                    </p>
                    <p className="text-sm text-gray-500">
                      Please do not close this window.
                    </p>
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
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || isPolling}
                >
                  {isCheckingOut ? "Processing..." : "Confirm Payment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4">
          {aggregatedCart.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your cart is empty.
                </p>
              </CardContent>
            </Card>
          ) : (
            aggregatedCart.map(({ product, quantity }) => (
              <Card key={product.product_id} className="border-border border">
                <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground md:mt-0">
                    <div className="flex items-center gap-2 rounded-full border border-border bg-white px-2 py-1">
                      <button
                        type="button"
                        onClick={() => handleDecreaseQuantity(product)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-sm"
                        aria-label={`Decrease quantity for ${product.name}`}
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-sm">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncreaseQuantity(product)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-sm"
                        aria-label={`Increase quantity for ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                    <span className="h-4 w-px bg-border" />
                    <span>Unit: ${Number(product.price).toFixed(2)}</span>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2 rounded-b-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>Line total</span>
                    <span className="font-medium">
                      ${(Number(product.price) * quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>Discount</span>
                    <span>{product.discount_percentage ?? 0}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>VAT</span>
                    <span>15%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>total payable</span>
                    <span>
                      $
                      {(Number(product.price) * quantity).toFixed(2) -
                        ((Number(product.price) * quantity).toFixed(2) *
                          product.discount_percentage) /
                          100 +
                        (Number(product.price) * quantity).toFixed(2) * 0.15}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveFromCart(product)}
                    >
                      Remove one
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="space-y-4 border-border border p-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Order summary
            </p>
            <h2 className="text-2xl font-semibold">Cart totals</h2>
          </div>

          <div className="grid gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Items</span>
              <span>
                {aggregatedCart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Products</span>
              <span>{aggregatedCart.length}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Payment method:{" "}
              {paymentMethod === "cash" ? "Cash" : "Bank Transfer"}
            </p>
            <p className="text-xs text-slate-500">
              Confirming checkout will create the sale and submit it for
              approval if needed.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
