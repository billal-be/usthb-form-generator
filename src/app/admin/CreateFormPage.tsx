'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import HomePageHeader from "@/components/HomePageHeader"
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Form = {
  id: number;
  form_name: string;
  form_description: string;
};

function TemplateCard({ title, formDescription, formId, onDelete }: { title: string, formDescription: string, formId: number, onDelete: (formId: number) => void }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`https://projuniv-backend.onrender.com/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Call the parent component's delete handler to update the UI
      onDelete(formId);
      setIsDialogOpen(false);

    } catch (error: any) {
      console.error("Error deleting form:", error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <Card className="p-6 relative"> {/* Added 'relative' here */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 z-10" // Added z-10
            disabled={isDeleting}
            title="Supprimer le brouillon"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le brouillon</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le brouillon "{title}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CardContent className="px-0">
        <h3 className="font-semibold text-base">{title}</h3>
        <div className="h-5 mt-1.5">
          <p className="text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
            {formDescription || ""}
          </p>
        </div>
      </CardContent>
      <CardFooter className="px-0">
        <Button className="w-fit bg-slate-100 hover:bg-slate-200 text-sm text-black font-bold" onClick={() => { router.push(`admin/create-form/${formId}`) }}>
          {isDeleting ? "Suppression..." : "Modifier"}
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

  const handleFormDelete = (formId: number) => {
    setForms(prevForms => prevForms.filter(form => form.id !== formId));
  };

  return (
    <main className="container mx-auto px-2 sm:px-4">
      <HomePageHeader
        title="Administrateur"
        description="Bienvenu dans votre espace !"
      />

      <hr className="mb-6 border-t border-muted" />

      <div>
        <h2 className="text-2xl my-6 font-extrabold">Formes Suggérées</h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Chargement ...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 py-4 bg-red-50 rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-red-700 mb-2">Erreur de chargement</h3>
            <p>{error}</p>
          </div>
        ) : forms.length === 0 ? (
          <p>No suggested forms available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forms.map((form) => (
              <TemplateCard key={form.id} title={form.form_name} formDescription={form.form_description} formId={form.id} onDelete={handleFormDelete} />
            ))}

            <Card className="p-6 border-dashed border-blue-600">
              <CardContent className="px-0">
                <h3 className="font-semibold text-base">Créer un modèle de formulaire</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ce modèle sera ajouté aux formulaires suggérés pour une utilisation rapide.
                </p>
              </CardContent>
              <CardFooter className="px-0">
                <Button className="w-fit bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white" onClick={() => { router.push(`admin/create-form`) }}>
                  <PlusCircle />
                  Créer un formulaire
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}