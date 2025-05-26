import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

interface EmptyFormsViewProps {
  text: string;
}

export default function EmptyFormsView({text}:(EmptyFormsViewProps)) {
  const router = useRouter();
  const goToCreateForm = () => {
    router.push('home/create-form');
  }
  return (
    <main className="container mx-auto flex flex-col">
      {/* État vide */}
      <div className='flex flex-col  flex-1'>
        <div className="flex flex-1  flex-col items-center justify-center gap-3 py-8">
          <div className="mb-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <Logo className="w-16 h-16 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-bold">
              {text}
            </h2>
            <p className="text-sm text-gray-500">
              Cliquez sur "Nouveau formulaire" pour commencer !
            </p>
          </div>

          <Button className="mt-4 bg-blue-600 hover:bg-blue-700 flex items-center gap-2" onClick={goToCreateForm}>
            <PlusCircle className="h-4 w-4" />
            <span>Nouveau formulaire</span>
          </Button>
        </div>
      </div>
    </main>
  );
}