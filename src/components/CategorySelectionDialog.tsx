import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Types
type Question = {
  question_text: string;
  question_type: string;
  answer_type: string;
  required: boolean;
  choices?: string[];
};

type Category = {
  category_name: string;
  questions: Question[];
};

type Form = {
  categories: Category[];
  form_name: string;
  form_description: string;
};

interface CategorySelectionDialogProps {
  onFormGenerated: (form: Form) => void;
}

export default function CategorySelectionDialog({ onFormGenerated }: CategorySelectionDialogProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Predefined categories data
  const availableCategories: Record<string, Category> = {
    "Informations personnelles": {
      "category_name": "Informations personnelles",
      "questions": [
        {
          "question_text": "Name",
          "question_type": "text",
          "answer_type": "question courte",
          "required": true
        },
        {
          "question_text": "Last Name",
          "question_type": "text",
          "answer_type": "question courte",
          "required": true
        },
        {
          "question_text": "Date de naissance",
          "question_type": "text",
          "answer_type": "date",
          "required": true
        },
        {
          "question_text": "Adresse email",
          "question_type": "text",
          "answer_type": "email",
          "required": true
        },
        {
          "question_text": "Numéro de téléphone",
          "question_type": "text",
          "answer_type": "numéro de téléphone",
          "required": true
        },
        {
          "question_text": "Matricule",
          "question_type": "text",
          "answer_type": "question courte",
          "required": true
        }
      ]
    },
    "Informations relatives au bac": {
      "category_name": "Informations relatives au bac",
      "questions": [
        {
          "question_text": "moyenne du bac",
          "question_type": "text",
          "answer_type": "question courte",
          "required": true
        },
        {
          "question_text": "Spécialité",
          "question_type": "select",
          "answer_type": "choix unique",
          "required": true,
          "choices": ["Matheleme", "Scientifique", "Math technique"]
        },
        {
          "question_text": "Copie de relevé de note (PDF)",
          "question_type": "text",
          "answer_type": "document",
          "required": true
        }
      ]
    },
    "Informations universitaires": {
      "category_name": "Informations universitaires",
      "questions": [
        {
          "question_text": "Université actuelle",
          "question_type": "text",
          "answer_type": "question courte",
          "required": true
        },
        {
          "question_text": "Faculté ou Institut",
          "question_type": "text",
          "answer_type": "question courte",
          "required": true
        },
        {
          "question_text": "Domaine d'étude",
          "question_type": "select",
          "answer_type": "choix unique",
          "required": true,
          "choices": [
            "Sciences et Technologies",
            "Sciences Sociales et Humaines",
            "Sciences de la Nature et de la Vie",
            "Sciences Economiques, de Gestion et Commerciales",
            "Lettres et Langues",
            "Droit et Sciences Politiques",
            "Médecine"
          ]
        },
        {
          "question_text": "Niveau actuel",
          "question_type": "select",
          "answer_type": "choix unique",
          "required": true,
          "choices": ["L1", "L2", "L3", "Master 1", "Master 2"]
        },
        {
          "question_text": "Copie de la carte d'étudiant (PDF)",
          "question_type": "text",
          "answer_type": "document",
          "required": true
        }
      ]
    }
  };

  const categoryOptions = [
    { key: "Informations personnelles", label: "Informations personnelles" },
    { key: "Informations relatives au bac", label: "Informations relatives au bac" },
    { key: "Informations universitaires", label: "Informations universitaires" }
  ];

  const toggleCategory = (categoryKey: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryKey)
        ? prev.filter(c => c !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const handleGenerateForm = () => {
    if (selectedCategories.length === 0) return;

    const selectedCategoryData = selectedCategories.map(key => availableCategories[key]).filter(Boolean);

    const form: Form = {
      categories: selectedCategoryData,
      form_name: "Nouveau Formulaire",
      form_description: "Formulaire généré automatiquement"
    };

    onFormGenerated(form);
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
      {/* Category Selection */}
      <div className="flex-1 p-6">
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          {categoryOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => toggleCategory(option.key)}
              className={`
                relative p-6 rounded-lg border-2 transition-all duration-200 text-left
                ${selectedCategories.includes(option.key)
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center justify-center mb-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${selectedCategories.includes(option.key)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                  }
                `}>
                  <Plus className="w-4 h-4" />
                </div>
              </div>

              <h4 className={`
                text-sm font-medium text-center transition-colors
                ${selectedCategories.includes(option.key)
                  ? 'text-blue-700'
                  : 'text-gray-700'
                }
              `}>
                {option.label}
              </h4>

              {selectedCategories.includes(option.key) && (
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end px-6 pb-6">
        <Button
          onClick={handleGenerateForm}
          disabled={selectedCategories.length === 0}
          className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Générer le Formulaire
        </Button>
      </div>
    </div>
  );
}