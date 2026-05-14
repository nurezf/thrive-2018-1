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

export default function CheckoutPage() {
  const { cart } = useProductStore();
  const [totalPrice, setTotalPrice] = useState(0);

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
          <p>total: $ {totalPrice}</p>
        </CardContent>
        <CardFooter>
          <Button>Checkout</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
