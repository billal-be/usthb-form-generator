"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react"; // Import LogIn icon
import Logo from "@/components/Logo";
import { toast, Toaster } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

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
          throw new Error("E-mail ou mot de passe invalide.");
        } else {
          throw new Error("Une erreur s'est produite. Veuillez réessayer.");
        }
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // fix role
      if (data.user.role === "User") {
        router.push("/home");
      } else if (data.user.role === "Admin") {
        router.push("/admin");
        //router.push("/home");
      } else {
        setError("Unknown user role");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Une erreur inattendue s'est produite";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false); // Stop loading
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
            <p className="text-sm text-gray-500">Entrez votre email ci-dessous</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="Email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {/* You can still show the error message in the form if you want */}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Connexion...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Connecter
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}