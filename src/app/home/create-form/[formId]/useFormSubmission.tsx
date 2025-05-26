import { useState } from 'react';
import { toast } from 'sonner';

type QuestionType =
  | "question courte"
  | "question longue"
  | "document"
  | "numéro de téléphone"
  | "nombre"
  | "choix unique"
  | "date"
  | "dropdown"
  | "email"
  | "wilaya";

type Question = {
  titre: string;
  type: QuestionType;
  obligatoire: boolean;
  choix?: string[];
};

type Section = {
  nom: string;
  questions: Question[];
};

type FormData = {
  titreFormulaire: string;
  description?: string;
  formType?: "draft" | "published";
  deadline?: Date;
  sections: Section[];
};

interface MappedQuestion {
  question_text: string;
  question_type: string;
  answer_type: string;
  required: boolean;
  choices?: Array<{ text: string }>;
}

// User type
interface User {
  id: number;
}

// Complex form creation request type with user object
type ComplexFormCreateRequest = {
  form: {
    form_name: string;
    form_type: string;
    form_description: string;
    visibility: string;
    deadline: string | null;
    form_link?: string; // Optional for drafts
    user: User | null;
  };
  categories: Array<{
    category_name: string;
    questions: Array<{
      question_text: string;
      question_type: string;
      answer_type: string;
      required: boolean;
      choices?: Array<{ text: string }>;
    }>;
  }>;
};

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [formLink, setFormLink] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  const generateRandomCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const getUser = (): User | null => {
    try {
      // Get user data directly from localStorage
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        // Ensure the ID is a number
        return {
          id: userData.id,
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting user from localStorage:", error);
      return null;
    }
  };

  const determineQuestionType = (type: QuestionType): string => {
    const selectTypes: QuestionType[] = ["choix unique", "dropdown"];
    return selectTypes.includes(type) ? "select" : "text";
  };

  const submitForm = async (formData: FormData): Promise<string | null> => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vous devez être connecté pour créer un formulaire");
        return null;
      }

      const currentUser = getUser();
      setUser(currentUser);

      // Only generate link for published forms
      const isDraft = formData.formType === "draft";
      let randomCode = "";

      if (!isDraft) {
        randomCode = generateRandomCode();
        setFormLink(randomCode);
      }

      const mappedCategories = formData.sections.map((section: Section) => {
        const mappedQuestions = section.questions.map((question: Question) => {
          const mappedQuestion: MappedQuestion = {
            question_text: question.titre,
            question_type: determineQuestionType(question.type),
            answer_type: question.type,
            required: question.obligatoire,
          };

          if (question.choix && question.choix.length > 0 &&
            ["choix multiple", "choix unique", "dropdown"].includes(question.type)) {
            // Use provided choices for select types - remove id field
            mappedQuestion.choices = question.choix.map((text: string) => ({
              text,
            }));
          }

          return mappedQuestion;
        });

        return {
          category_name: section.nom,
          questions: mappedQuestions
        };
      });

      const complexFormData: ComplexFormCreateRequest = {
        form: {
          form_name: formData.titreFormulaire,
          form_type: formData.formType || "published",
          form_description: formData.description || "",
          visibility: "public",
          deadline: formData.deadline ? formData.deadline.toISOString() : null,
          user: currentUser,
        },
        categories: mappedCategories
      };

      // Only add form_link for published forms
      if (!isDraft) {
        complexFormData.form.form_link = randomCode;
      }

      console.log("Sending complex form data to API:", complexFormData);

      const formResponse = await fetch("https://projuniv-backend.onrender.com/forms/complex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(complexFormData),
      });

      if (!formResponse.ok) {
        const errorData = await formResponse.text();
        throw new Error(`API Error: ${formResponse.status} - ${errorData}`);
      }

      const formResponseData = await formResponse.json();
      console.log("Form API Response:", formResponseData);

      const newFormId = formResponseData.id || formResponseData.form_id || formResponseData.formId;
      setFormId(newFormId);

      toast.success(isDraft ? "Brouillon enregistré avec succès" : "Formulaire publié avec succès");

      return newFormId;
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Erreur lors de la soumission du formulaire");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitForm,
    isSubmitting,
    formId,
    setFormId,
    formLink,
    generateRandomCode,
    user
  };
};