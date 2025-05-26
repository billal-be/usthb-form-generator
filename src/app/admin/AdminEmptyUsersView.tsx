import React from 'react';
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminEmptyUsersView() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="h-12 w-12 text-gray-400" />
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun utilisateur trouvé
        </h3>
        
        <p className="text-gray-500 text-sm mb-6">
          Il n'y a pas encore d'utilisateurs enregistrés sur la plateforme. Commencez par créer le premier utilisateur.
        </p>
        
        <Button 
          onClick={() => router.push('/admin?section=create-user')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un utilisateur
        </Button>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-6">
          <p className="text-xs text-gray-600">
            Les utilisateurs créés apparaîtront ici et pourront accéder à la plateforme avec leurs identifiants.
          </p>
        </div>
      </div>
    </div>
  );
}
