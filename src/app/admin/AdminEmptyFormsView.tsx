import React from 'react';

export default function AdminEmptyFormsView() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg 
            className="mx-auto h-24 w-24 text-gray-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun formulaire publié
        </h3>
        
        <p className="text-gray-500 text-sm mb-6">
          Il n'y a pas encore de formulaires publiés. Les formulaires apparaîtront ici une fois qu'ils seront créés et publiés.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600">
            Les formulaires publiés par les utilisateurs s'afficheront dans cette section pour que vous puissiez les gérer.
          </p>
        </div>
      </div>
    </div>
  );
}