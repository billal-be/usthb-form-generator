"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { toast, Toaster } from "sonner"; // Import sonner

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("https://projuniv-backend.onrender.com/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid email or password");
        } else {
          throw new Error("Something went wrong. Please try again.");
        }
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // fix role
      if (data.user.role === "User") {
        router.push("/admin");
      } else if (data.user.role === "Admin") {
        router.push("/home");
      } else {
        setError("Unknown user role");
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      toast.error(errorMessage); // Show toast error
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      {/* Toast notifications */}
      <Toaster position="top-center" richColors />

      {/* Title */}
      <div className="flex mb-8">
        <div className="text-3xl mr-1">USTHB</div>
        <Logo className="w-9 h-9 text-blue-600" />
        <div className="text-3xl font-extrabold -ml-1 text-blue-600">ORMS</div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md border border-gray-200">
        <CardHeader>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Log In</h2>
            <p className="text-sm text-gray-500">Enter your email below</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                placeholder="me@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {/* You can still show the error message in the form if you want */}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit">
              login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}