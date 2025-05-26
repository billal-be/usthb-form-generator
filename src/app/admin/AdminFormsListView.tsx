"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { toast } from 'sonner';

type Form = {
  id: number;
  form_name: string;
  form_description: string;
  numberOfResponses?: number;
};

function TemplateCard({
  title,
  formDescription,
  formId,
  numberOfResponses = 0,
  onDelete
}: {
  title: string,
  formDescription: string,
  formId: number,
  numberOfResponses?: number,
  onDelete: (formId: number) => void
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    // Navigate to the response page with the form ID
    router.push(`admin/responses/${formId}?name=${encodeURIComponent(title)}`);
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
      console.error("Error deleting form:", error);
      toast.error("Erreur lors de la suppression")

    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  return (
    <Card className="p-6 relative flex flex-col">
      {/* Delete button positioned in top-right corner */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
            disabled={isDeleting}
            title="Supprimer le formulaire"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le formulaire</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le formulaire "{title}" ? Cette action est irréversible et toutes les réponses associées seront également supprimées.
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

      <CardContent className="px-0 pr-8 flex-1 flex flex-col">
        <h3 className="font-semibold text-base truncate">{title}</h3>
        <div className="h-10 mt-1 mb-3">
          <p className="text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
            {formDescription || ""}
          </p>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
            {numberOfResponses} {numberOfResponses === 1 ? 'réponse' : 'réponses'}
          </span>
        </div>
      </CardContent>

      <CardFooter className="px-0 mt-auto">
        <Button
          className="w-fit bg-slate-100 hover:bg-slate-200 text-sm text-black font-bold"
          onClick={handleClick}
          disabled={isDeleting}
        >
          {isDeleting ? "Suppression..." : "Ouvrir"}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface FormsListViewProps {
  forms: Form[];
  onFormDelete: (formId: number) => void;
}

export default function AdminFormsListView({ forms, onFormDelete }: FormsListViewProps) {
  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold mb-4">
        Formulaires publiés ({forms.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map((form) => (
          <TemplateCard
            key={form.id}
            title={form.form_name}
            formDescription={form.form_description}
            formId={form.id}
            numberOfResponses={form.numberOfResponses}
            onDelete={onFormDelete}
          />
        ))}
      </div>
    </div>
  );
}