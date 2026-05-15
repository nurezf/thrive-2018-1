//footer
"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Footer = () => {
  const router = useRouter();
  const userRole = localStorage.getItem("role");
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("user_id");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  const handleHome = () => {
    router.push("/productDisplay");
  };

  return (
    <footer className="flex items-center justify-between gap-2 mt-2  bottom-0 w-full bg-background py-2 px-4 z-50 bg-black/20 backdrop-blur-md">
      <Button
        onClick={handleCheckout}
        className="bg-primary text-primary-foreground"
      >
        Checkout
      </Button>
      <Button
        onClick={handleHome}
        className="bg-primary text-primary-foreground"
      >
        Home
      </Button>
      {accessToken ? (
        <Button onClick={handleLogout} className="bg-red-500 text-white">
          Logout
        </Button>
      ) : (
        <>
          <Button onClick={handleLogin} className="bg-blue-500 text-white">
            Login
          </Button>
          <Button onClick={handleSignup} className="bg-green-500 text-white">
            Signup
          </Button>
        </>
      )}
    </footer>
  );
};
