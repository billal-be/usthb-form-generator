'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
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
import EmptyFormsView from "./EmptyFormsView";
import { toast, Toaster } from 'sonner';

type Form = {
  id: number;
  form_name: string;
  form_description: string;
};

function TemplateCard({
  title,
  formDescription,
  formId,
  onDelete
}: {
  title: string,
  formDescription: string,
  formId: number,
  onDelete: (formId: number) => void
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    router.push(`home/create-form/${formId}`);
  };

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
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <Card className="p-6 relative">
      {/* Delete button positioned in top-right corner */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
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

      <CardContent className="px-0 pr-8"> {/* Add right padding to avoid overlap with delete button */}
        <h3 className="font-semibold text-base">{title}</h3>
        <div className="h-5 mt-1.5">
          <p className="text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
            {formDescription || ""}
          </p>
        </div>
      </CardContent>
      <CardFooter className="px-0">
        <Button
          className="w-fit bg-slate-100 hover:bg-slate-200 text-sm text-black font-bold"
          onClick={handleClick}
          disabled={isDeleting}
        >
          {isDeleting ? "Suppression..." : "Utiliser ce modèle"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function MyDraftsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFormDelete = (formId: number) => {
    setForms(prevForms => prevForms.filter(form => form.id !== formId));
  };

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
        setError("échec du chargement de votre brouillon.");
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
          <EmptyFormsView text="Vous n'avez encore aucun brouillon" />
        ) : (

          <>
            <h2 className="text-xl font-semibold mb-4">
              Formulaires en brouillon ({forms.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {forms.map((form) => (
                <TemplateCard
                  key={form.id}
                  title={form.form_name}
                  formDescription={form.form_description}
                  formId={form.id}
                  onDelete={handleFormDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
