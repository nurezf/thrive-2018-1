"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { jwtDecode } from "jwt-decode";

import { useRouter } from "next/navigation";
import axios from "axios";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type ValidationErrors = {
  email?: string;
  password?: string;
};

function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setErrors({});

    // Validate form data
    const validation = loginSchema.safeParse({
      email,
      password,
    });

    if (!validation.success) {
      const fieldErrors: ValidationErrors = {};

      validation.error.issues.forEach((err) => {
        const field = err.path[0] as keyof ValidationErrors;
        fieldErrors[field] = err.message;
      });

      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await axios("http://localhost:8000/api/users/login", {
        data: {
          username: email,
          password,
        },
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(res.data);

      if (!res.data?.accessToken) {
        const errorMsg = res.data.error || res.data.message || "Login failed";

        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      toast.success("Logged in successfully");

      localStorage.setItem("accessToken", res.data.accessToken);
      const decodedToken: any = jwtDecode(res.data.accessToken);

      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }

      localStorage.setItem("user", JSON.stringify(res.data.user));

      router.push("/admin/dashboard");
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || error.message || "Login failed";

      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Login to your Admin Account</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={login}>
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  // Clear email error while typing
                  if (errors.email) {
                    setErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }));
                  }
                }}
                placeholder="admin@example.com"
                className={`mt-1 ${
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />

              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  // Clear password error while typing
                  if (errors.password) {
                    setErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }
                }}
                placeholder="••••••••"
                className={`mt-1 ${
                  errors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />

              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* API Error */}
            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="flex items-center justify-between gap-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="text-xs text-slate-500 flex flex-col items-center gap-2">
          <p>Use your credentials to access the dashboard.</p>

          <p>
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </section>
  );
}

export default LoginPage;
