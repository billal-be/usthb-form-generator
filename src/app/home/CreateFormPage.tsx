'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import HomePageHeader from "@/components/HomePageHeader"
import { useRouter } from "next/navigation";

type Form = {
  id: number;
  form_name: string;
  form_description: string;
};

function TemplateCard({ title, formDescription,formId }: { title: string, formDescription: string,formId: number }) {
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

export default function CreateFormPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goToCreateForm = () => {
    router.push('home/create-form');
  }

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the authentication token from localStorage
        const token = localStorage.getItem('token');

        const response = await fetch("https://projuniv-backend.onrender.com/forms/type/suggested", {
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
        console.error("Error fetching forms:", error);
        setError("Failed to load suggested forms.");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  return (
    <main className="container mx-auto px-2 sm:px-4">
      <HomePageHeader
        title="Formulaire"
        description="Générez des formulaires officiels rapidement et efficacement avec l'IA."
      />

      <hr className="mb-6 border-t border-muted" />

      <Card className="mb-8 p-6">
        <CardContent className="px-0 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-base">
              Créer un formulaire à partir de zéro
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Utilisez l'IA pour générer un formulaire personnalisé adapté à vos besoins.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 ml-2" onClick={goToCreateForm}>
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Créer</span>
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl mb-6 font-extrabold">Suggested Forms</h2>

        {loading ? (
          <p>Loading suggested forms...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : forms.length === 0 ? (
          <p>No suggested forms available at the moment.</p>
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