'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import HomePageHeader from "@/components/HomePageHeader"
import { useRouter } from "next/navigation";

type Form = {
  id: number;
  form_name: string;
  form_description: string;
};

function TemplateCard({ title, formDescription, formId }: { title: string, formDescription: string, formId: number }) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`home/create-form/${formId}`);
  }

  return (
    <Card className="p-6">
      <CardContent className="px-0">
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1"> {/* Texte plus petit */}
          {formDescription}
        </p>
      </CardContent>
      <CardFooter className="px-0">
        <Button className="w-fit bg-slate-100 hover:bg-slate-200 text-sm text-black font-bold" onClick={handleClick}>
          Utiliser ce modèle
        </Button>
      </CardFooter>
    </Card>
  );
}



export default function MyDraftsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserForms = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get user from localStorage
        const userString = localStorage.getItem("user");
        if (!userString) {
          throw new Error("No user found in localStorage");
        }

        // Parse user object to get the ID
        const userObject = JSON.parse(userString);
        const userId = userObject.id;

        if (!userId) {
          throw new Error("No user ID found");
        }

        // Get the authentication token from localStorage
        const token = localStorage.getItem('token');

        // Fetch published forms for the user
        const response = await fetch(`https://projuniv-backend.onrender.com/forms/user/${userId}/drafts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        setForms(data);
      } catch (error) {
        console.error("Error fetching user forms:", error);
        setError("Failed to load your published forms.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserForms();
  }, []);

  return (
    <main className="container mx-auto px-2 sm:px-4">
      {/* En-tête ultra-compact */}
      <HomePageHeader title='Drafts' description='Retrouvez tous vos drafts enregistrés et modifiez-les facilement.'></HomePageHeader>

      <hr className="mb-6 border-t border-muted" />

      <div>
        {/* Grille de drafts */}
        {loading ? (
          <p>Loading forms...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : forms.length === 0 ? (
          <p>No drafts available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forms.map((form) => (
              <TemplateCard key={form.id} title={form.form_name} formDescription={form.form_description} formId={form.id} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}