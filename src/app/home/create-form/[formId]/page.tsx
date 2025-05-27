"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, PlusCircleIcon, GripVertical } from "lucide-react";
import { XIcon } from "lucide-react";
import { Delete } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { CheckedState } from "@radix-ui/react-checkbox";
import AIChatDialog from "@/components/AIChatDialog";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { fr } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Copy } from "lucide-react"
import { toast, Toaster } from "sonner";
import { useFormSubmission } from "./useFormSubmission";
import { useRouter, useParams } from 'next/navigation';
import Logo from "@/components/Logo";


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

interface EmailReponse {
  domainList?: string[]; // Optional list of allowed domains
  required?: boolean;
}

interface DocumentReponse {
  types?: string[];
  tailleMax?: number;
  multipleFiles?: boolean; // New property to allow multiple files
  files?: Array<{ id: string; name: string }>; // To track uploaded files
}

interface NumeroDeTelephoneReponse {
  format?: "international" | "national";
}

interface NombreReponse {
  min?: number;
  max?: number;
}

interface ReponseQuestion {
  document?: DocumentReponse;
  numeroDeTelephone?: NumeroDeTelephoneReponse;
  nombre?: NombreReponse;
  date?: object;
  email?: EmailReponse;
}

interface Question {
  id: number;
  type: QuestionType;
  obligatoire: boolean;
  titre: string;
  choix?: string[];
  reponse?: ReponseQuestion;
}

interface Section {
  id: number;
  nom: string;
  obligatoire: boolean;
  questions: Question[];
}

const FormulaireConstructeur: React.FC = () => {
  const globalQuestionIdRef = useRef(2);
  const globalSectionIdRef = useRef(2);


  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      nom: "Section 1",
      obligatoire: false,
      questions: [
        {
          id: 1,
          type: "question courte",
          obligatoire: true,
          titre: "Nouvelle question",
        },
      ],
    },
  ]);

  type StepType = "selection" | "showLink" | "link";
  const [step, setStep] = useState<StepType>("selection");
  const router = useRouter();
  const [sectionActive, setSectionActive] = useState<number>(0);
  const [questionActive, setQuestionActive] = useState<number>(0);
  const [titreFormulaire, setTitreFormulaire] = useState<string>(
    "Formulaire sans titre"
  );
  const [description, setDescription] = useState<string>("");
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showChat, setShowChat] = useState(false);
  const {
    submitForm,
    isSubmitting,
    formId: hookFormId,
    setFormId,
    formLink,
    generateRandomCode,
    user
  } = useFormSubmission();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [isCreatingForm, setIsCreatingForm] = useState<boolean>(false);
  const [time, setTime] = useState({ hours: "23", minutes: "59" });

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  const getDateTime = () => {
    if (!date) return null;
    const dateTime = new Date(date);
    dateTime.setHours(parseInt(time.hours));
    dateTime.setMinutes(parseInt(time.minutes));
    dateTime.setSeconds(0);
    dateTime.setMilliseconds(0);
    return dateTime;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage - this will affect form submissions");
    }
  }, []);

  const determineQuestionType = (type: QuestionType): string => {
    const selectTypes: QuestionType[] = ["choix unique", "dropdown"];
    return selectTypes.includes(type) ? "select" : "text";
  };

  type ExternalQuestion = {
    question_text: string;
    question_type: string;
    answer_type: string;
    required: boolean;
    choices?: string[];
  };

  type ExternalCategory = {
    category_name: string;
    questions: ExternalQuestion[];
  };

  type ExternalForm = {
    categories: ExternalCategory[];
    form_name: string;
    form_description: string;
    form_type: string;
  };

  const [Form, setForm] = useState<ExternalForm | null>(null);

  const handleFormGenerated = (form: ExternalForm) => {
    setForm(form);
    setShowChat(false);
  };

  const params = useParams();
  const formId = params?.formId as string;

  useEffect(() => {
    const fetchForm = async () => {
      try {
        // Extract formId from params
        const token = localStorage.getItem('token');

        if (formId) {
          // Make API request
          const response = await fetch(`https://projuniv-backend.onrender.com/forms/${formId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setForm(data);
        }
      } catch (error) {
        console.error('Error fetching form:', error);
        toast.error('Erreur lors du chargement du formulaire');
      }
    };

    fetchForm();
  }, [params]);

  useEffect(() => {
    if (Form) {
      setTitreFormulaire(Form.form_name);
      setDescription(Form.form_description);

      let currentSectionId = globalSectionIdRef.current;
      let currentQuestionId = globalQuestionIdRef.current;

      const mappedSections: Section[] = Form.categories.map(cat => {
        const mappedQuestions: Question[] = cat.questions.map(q => ({
          id: currentQuestionId++,
          type: q.answer_type as QuestionType,
          obligatoire: q.required,
          titre: q.question_text,
          choix: q.choices
            ? q.choices.map(item => typeof item === 'string' ? item : item.text)
            : []
        }));

        return {
          id: currentSectionId++,
          nom: cat.category_name,
          obligatoire: false,
          questions: mappedQuestions,
        };
      });

      globalSectionIdRef.current = currentSectionId;
      globalQuestionIdRef.current = currentQuestionId;

      setSections(mappedSections);
      setSectionActive(0);
      setQuestionActive(0);
    }
  }, [Form]);

  const validateForm = () => {
    if (!titreFormulaire.trim()) {
      toast.error("Veuillez donner un titre au formulaire");
      return false;
    }

    if (!sections.length || !sections.some(section => section.questions.length > 0)) {
      toast.error("Ajoutez au moins une section avec une question");
      return false;
    }

    return true;
  };

  const deleteForm = async (formId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://projuniv-backend.onrender.com/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete the form");
      }

    } catch (error) {
      console.error("Erreur lors de la suppression du formulaire :", error);
    }
  };

  const saveAsDraft = async () => {
    if (!validateForm()) return;

    try {
      const formData = {
        titreFormulaire,
        description,
        sections,
        formType: "draft" as const
      };

      const newFormId = await submitForm(formData);

      if (newFormId) {
        if (Form?.form_type === "draft") {
          await deleteForm(formId);
        }
        toast.success("Brouillon enregistré avec succès!");
        setTimeout(() => {
          router.push("/home?section=drafts");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Erreur lors de l'enregistrement du brouillon");
    }
  };

  const handleSubmitForm = async (asDraft = false, endDateTime: Date | null | undefined = null) => {
    if (!validateForm()) return null;
    setIsCreatingForm(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vous devez être connecté pour créer un formulaire");
        return null;
      }

      // Use endDateTime if provided, otherwise fall back to date
      const deadline = endDateTime || date;

      const formData = {
        titreFormulaire,
        description,
        sections: sections.map(section => ({
          nom: section.nom,
          questions: section.questions.map(question => ({
            titre: question.titre,
            type: question.type,
            obligatoire: question.obligatoire,
            choix: question.choix
          }))
        })),
        deadline: deadline,
        formType: asDraft ? "draft" as const : "published" as const
      };

      console.log("Submitting form with data:", formData);
      const newFormId = await submitForm(formData);

      if (newFormId) {
        if (Form?.form_type === "draft") {
          await deleteForm(formId);
        }
        if (!asDraft) {
          setGeneratedLink(formLink);
          setFormId(newFormId);
          setStep("showLink");
        } else {
          setTimeout(() => {
            router.push('/home');
          }, 1500);
        }
        return newFormId;
      }
      return null;
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erreur lors de la soumission du formulaire");
      return null;
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handlePublishForm = async () => {
    const formId = await handleSubmitForm(false);
  };

  const handleSaveAsDraft = async () => {
    const formId = await handleSubmitForm(true);
  };

  const handleCopyLink = () => {
    if (formLink) {
      navigator.clipboard.writeText(formLink);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  const handleViewForm = () => {
    if (hookFormId) {
      router.push(`/${formLink}`);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const updatedSections = Array.from(sections);
    const [removed] = updatedSections.splice(source.index, 1);
    updatedSections.splice(destination.index, 0, removed);

    setSections(updatedSections);

    if (source.index === sectionActive) {
      setSectionActive(destination.index);
    } else if (destination.index === sectionActive) {
      setSectionActive(source.index);
    }
  };

  const ajouterSection = () => {
    const newSectionId = globalSectionIdRef.current;
    const newQuestionId = globalQuestionIdRef.current;

    const nouvellesSections: Section[] = [
      ...sections,
      {
        id: newSectionId,
        nom: `Section ${sections.length + 1}`,
        obligatoire: false,
        questions: [
          {
            id: newQuestionId,
            type: "question courte",
            obligatoire: true,
            titre: "Nouvelle question",
          },
        ],
      },
    ];

    setSections(nouvellesSections);
    globalSectionIdRef.current = globalSectionIdRef.current + 1;
    globalQuestionIdRef.current = globalQuestionIdRef.current + 1;
    setSectionActive(nouvellesSections.length - 1);
    setQuestionActive(0);
  };

  const supprimerSection = (indexSection: number) => {
    const sectionsMisesAJour = sections.filter(
      (_, index) => index !== indexSection
    );
    setSections(sectionsMisesAJour);
    setSectionActive(Math.max(0, indexSection - 1));
    setQuestionActive(0);
  };

  const supprimerQuestion = (sectionIndex: number, indexQuestion: number) => {
    const sectionsMisesAJour = [...sections];
    sectionsMisesAJour[sectionIndex].questions = sectionsMisesAJour[
      sectionIndex
    ].questions.filter((_, index) => index !== indexQuestion);
    setSections(sectionsMisesAJour);

    // Only update questionActive if we're deleting from the currently active section
    if (sectionIndex === sectionActive) {
      setQuestionActive(Math.max(0, indexQuestion - 1));
    }
  };

  const ajouterQuestion = (sectionIndex: number) => {
    const newQuestionId = globalQuestionIdRef.current;
    const sectionsMisesAJour = [...sections];

    sectionsMisesAJour[sectionIndex].questions.push({
      id: newQuestionId,
      type: "question courte",
      obligatoire: true,
      titre: "Nouvelle question",
    });

    setSections(sectionsMisesAJour);
    globalQuestionIdRef.current = globalQuestionIdRef.current + 1;
    setSectionActive(sectionIndex);
    setQuestionActive(sectionsMisesAJour[sectionIndex].questions.length - 1);
  };

  const modifierTypeQuestion = (
    sectionIndex: number,
    indexQuestion: number,
    type: QuestionType
  ) => {
    setSections((sectionsPrecedentes) => {
      return sectionsPrecedentes.map((section, currentSectionIndex) => {
        if (currentSectionIndex === sectionIndex) {
          return {
            ...section,
            questions: section.questions.map((question, indexQ) => {
              if (indexQ === indexQuestion) {
                const questionMiseAJour: Question = {
                  ...question,
                  type: type,
                  choix:
                    type === "choix unique" ||
                      type === "dropdown"
                      ? ["Option 1", "Option 2", "Option 3"]
                      : undefined,
                  reponse:
                    type === "document"
                      ? {
                        document: {
                          types: [".pdf", ".doc", ".docx", ".txt"],
                          tailleMax: 5,
                          multipleFiles: false,
                          files: [],
                        },
                      }
                      : type === "numéro de téléphone"
                        ? { numeroDeTelephone: { format: "international" } }
                        : type === "nombre"
                          ? { nombre: {} }
                          : type === "date"
                            ? { date: {} }
                            : undefined,
                };
                return questionMiseAJour;
              }
              return question;
            }),
          };
        }
        return section;
      });
    });
  };

  // Fixed ajouterChoix function
  const ajouterChoix = (sectionIndex: number, indexQuestion: number) => {
    setSections((sectionsPrecedentes) => {
      return sectionsPrecedentes.map((section, currentSectionIndex) => {
        if (currentSectionIndex === sectionIndex) {
          return {
            ...section,
            questions: section.questions.map((question, indexQ) => {
              if (indexQ === indexQuestion) {
                const nouvellesChoix = question.choix
                  ? [...question.choix, `Option ${question.choix.length + 1}`]
                  : ["Option 1"];
                return { ...question, choix: nouvellesChoix };
              }
              return question;
            }),
          };
        }
        return section;
      });
    });
  };

  const modifierChoix = (
    sectionIndex: number,
    indexQuestion: number,
    indexChoix: number,
    nouvelleValeur: string
  ) => {
    setSections((sectionsPrecedentes) => {
      return sectionsPrecedentes.map((section, currentSectionIndex) => {
        if (currentSectionIndex === sectionIndex) {
          return {
            ...section,
            questions: section.questions.map((question, indexQ) => {
              if (indexQ === indexQuestion) {
                const choixMisesAJour = question.choix
                  ? [...question.choix]
                  : [];
                choixMisesAJour[indexChoix] = nouvelleValeur;
                return { ...question, choix: choixMisesAJour };
              }
              return question;
            }),
          };
        }
        return section;
      });
    });
  };

  const supprimerChoix = (
    sectionIndex: number,
    indexQuestion: number,
    indexChoix: number
  ) => {
    setSections((sectionsPrecedentes) => {
      return sectionsPrecedentes.map((section, currentSectionIndex) => {
        if (currentSectionIndex === sectionIndex) {
          return {
            ...section,
            questions: section.questions.map((question, indexQ) => {
              if (indexQ === indexQuestion && question.choix) {
                const choixMisesAJour = question.choix.filter(
                  (_, index) => index !== indexChoix
                );
                return { ...question, choix: choixMisesAJour };
              }
              return question;
            }),
          };
        }
        return section;
      });
    });
  };

  const modifierReponseQuestion = (
    indexQuestion: number,
    field: keyof ReponseQuestion,
    value: any,
    subField?: string
  ) => {
    setSections((sectionsPrecedentes) => {
      return sectionsPrecedentes.map((section, indexSection) => {
        if (indexSection === sectionActive) {
          return {
            ...section,
            questions: section.questions.map((question, indexQ) => {
              if (indexQ === indexQuestion) {
                const reponseActuelle = question.reponse || {};
                if (subField) {
                  return {
                    ...question,
                    reponse: {
                      ...reponseActuelle,
                      [field]: {
                        ...((reponseActuelle[field] as object) || {}),
                        [subField]: value,
                      },
                    },
                  };
                }
                return {
                  ...question,
                  reponse: { ...reponseActuelle, [field]: value },
                };
              }
              return question;
            }),
          };
        }
        return section;
      });
    });
  };

  const rendreChampQuestion = (
    question: Question,
    sectionIndex: number,
    indexQuestion: number
  ) => {
    switch (question.type) {
      case "choix unique":
        return (
          <div className="space-y-2">
            {question.choix?.map((choix, index) => (
              <div key={index} className="flex items-center space-x-2 group">
                <div className="flex items-center flex-grow">
                  {question.type === "choix unique" ? (
                    <Input
                      type="radio"
                      name="choix-unique"
                      id={`choix-${index}`}
                      className="mr-2 h-4 w-4 border border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  ) : (
                    <Input
                      type="checkbox"
                      id={`choix-${index}`}
                      className="mr-2 h-4 w-4 border border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  )}
                  <Input
                    value={choix}
                    onChange={(e) =>
                      modifierChoix(
                        sectionIndex,
                        indexQuestion,
                        index,
                        e.target.value
                      )
                    }
                    className="flex-grow"
                    placeholder="option"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() =>
                      supprimerChoix(sectionIndex, indexQuestion, index)
                    }
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer"
              onClick={() => ajouterChoix(sectionIndex, indexQuestion)}
            >
              <PlusIcon className="h-4 w-4" />
              <span className="text-sm">Ajouter une nouvelle option</span>
            </div>
          </div>
        );

      case "document":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm">Types de fichiers autorisés :</label>
              <div className="flex flex-wrap gap-2">
                {[".pdf", ".doc", ".docx", ".txt", ".jpg", ".png"].map(
                  (type) => {
                    const types = question.reponse?.document?.types || [];
                    const isChecked = types.includes(type);

                    return (
                      <div key={type} className="flex items-center space-x-1">
                        <Checkbox
                          id={`file-type-${sectionIndex}-${indexQuestion}-${type.replace(
                            ".",
                            ""
                          )}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const newTypes = [
                              ...(question.reponse?.document?.types || []),
                            ];

                            if (checked) {
                              if (!newTypes.includes(type)) {
                                newTypes.push(type);
                              }
                            } else {
                              const index = newTypes.indexOf(type);
                              if (index !== -1) {
                                newTypes.splice(index, 1);
                              }
                            }

                            modifierReponseQuestion(
                              indexQuestion,
                              "document",
                              {
                                types: newTypes,
                                tailleMax:
                                  question.reponse?.document?.tailleMax || 5,
                                files: question.reponse?.document?.files || [],
                              },
                              undefined
                            );
                          }}
                          className="border-blue-600 data-[state=checked]:bg-blue-600"
                        />
                        <label
                          htmlFor={`file-type-${sectionIndex}-${indexQuestion}-${type.replace(
                            ".",
                            ""
                          )}`}
                          className="text-sm cursor-pointer"
                        >
                          {type}
                        </label>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm">Taille maximale (Mo) :</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={question.reponse?.document?.tailleMax || 5}
                onChange={(e) => {
                  const tailleMax = Number(e.target.value);
                  modifierReponseQuestion(
                    indexQuestion,
                    "document",
                    {
                      types: question.reponse?.document?.types || [],
                      tailleMax,
                      files: question.reponse?.document?.files || [],
                    },
                    undefined
                  );
                }}
                className="w-24"
              />
            </div>

            {/* Display uploaded file if any */}
            {question.reponse?.document?.files &&
              question.reponse.document.files.length > 0 && (
                <div className="mt-2 space-y-2">
                  <label className="text-sm font-medium">
                    Fichier téléchargé :
                  </label>
                  <div className="space-y-1">
                    {question.reponse.document.files.slice(0, 1).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => {
                            modifierReponseQuestion(
                              indexQuestion,
                              "document",
                              {
                                types: question.reponse?.document?.types || [],
                                tailleMax:
                                  question.reponse?.document?.tailleMax || 5,
                                files: [],
                              },
                              undefined
                            );
                          }}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* File input section for single file */}
            <div className="mt-2">
              <label className="block text-sm mb-1">
                Sélectionnez un fichier
              </label>
              <div className="relative">
                <Input
                  type="file"
                  className="w-full"
                  accept={
                    question.reponse?.document?.types?.join(",") ||
                    ".pdf,.doc,.docx,.txt"
                  }
                  onChange={(e) => {
                    const fileInput = e.target as HTMLInputElement;
                    if (fileInput.files && fileInput.files.length > 0) {
                      const file = fileInput.files[0];
                      const allowedTypes =
                        question.reponse?.document?.types || [];
                      const maxSize =
                        (question.reponse?.document?.tailleMax || 5) *
                        1024 *
                        1024; // Convert MB to bytes

                      // Check file type
                      const fileExt = `.${file.name
                        .split(".")
                        .pop()
                        ?.toLowerCase()}`;
                      const validType = allowedTypes.includes(fileExt);

                      // Check file size
                      const validSize = file.size <= maxSize;

                      if (!validType) {
                        alert(
                          `Le fichier "${file.name
                          }" n'est pas d'un type autorisé. Types autorisés: ${allowedTypes.join(
                            ", "
                          )}`
                        );
                        fileInput.value = "";
                        return;
                      }

                      if (!validSize) {
                        alert(
                          `Le fichier "${file.name
                          }" dépasse la taille maximale de ${question.reponse?.document?.tailleMax || 5
                          } Mo`
                        );
                        fileInput.value = "";
                        return;
                      }

                      const newFile = {
                        id: Date.now() + Math.random().toString(36).substring(2, 9),
                        name: file.name,
                      };

                      modifierReponseQuestion(
                        indexQuestion,
                        "document",
                        {
                          types: question.reponse?.document?.types || [],
                          tailleMax: question.reponse?.document?.tailleMax || 5,
                          files: [newFile],
                        },
                        undefined
                      );

                      // Reset the file input after processing
                      fileInput.value = "";
                    }
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Types autorisés:{" "}
                  {question.reponse?.document?.types?.join(", ") ||
                    ".pdf, .doc, .docx, .txt"}
                  <br />
                  Taille maximale: {question.reponse?.document?.tailleMax ||
                    5}{" "}
                  Mo
                </div>
              </div>
            </div>
          </div>
        );
      case "numéro de téléphone":
        return (
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="Entrez un numéro de téléphone"
              className="w-full"
            />
          </div>
        );

      case "nombre":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Entrez un nombre"
              className="w-full"
            />
          </div>
        );

      case "question courte":
        return <Input placeholder="Réponse courte" />;

      case "question longue":
        return (
          <textarea
            placeholder="Réponse longue"
            className="w-full border rounded p-2 min-h-[100px]"
          />
        );
      case "date":
        return (
          <div className="space-y-2">
            <Input type="date" className="w-full" />
          </div>
        );
      case "email":
        return (
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="email"
                placeholder="exemple@domaine.com"
                className="w-full pl-10 h-11 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
              </div>
              {question.reponse?.email?.domainList &&
                question.reponse.email.domainList.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    Domaines autorisés:{" "}
                    {question.reponse.email.domainList.join(", ")}
                  </div>
                )}
            </div>
          </div>
        );

      case "wilaya":
        return (
          <div className="space-y-2">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez une wilaya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Adrar</SelectItem>
                <SelectItem value="2">2 - Chlef</SelectItem>
                <SelectItem value="3">3 - Laghouat</SelectItem>
                <SelectItem value="4">4 - Oum El Bouaghi</SelectItem>
                <SelectItem value="5">5 - Batna</SelectItem>
                <SelectItem value="6">6 - Béjaïa</SelectItem>
                <SelectItem value="7">7 - Biskra</SelectItem>
                <SelectItem value="8">8 - Béchar</SelectItem>
                <SelectItem value="9">9 - Blida</SelectItem>
                <SelectItem value="10">10 - Bouira</SelectItem>
                <SelectItem value="11">11 - Tamanrasset</SelectItem>
                <SelectItem value="12">12 - Tébessa</SelectItem>
                <SelectItem value="13">13 - Tlemcen</SelectItem>
                <SelectItem value="14">14 - Tiaret</SelectItem>
                <SelectItem value="15">15 - Tizi Ouzou</SelectItem>
                <SelectItem value="16">16 - Alger</SelectItem>
                <SelectItem value="17">17 - Djelfa</SelectItem>
                <SelectItem value="18">18 - Jijel</SelectItem>
                <SelectItem value="19">19 - Sétif</SelectItem>
                <SelectItem value="20">20 - Saïda</SelectItem>
                <SelectItem value="21">21 - Skikda</SelectItem>
                <SelectItem value="22">22 - Sidi Bel Abbès</SelectItem>
                <SelectItem value="23">23 - Annaba</SelectItem>
                <SelectItem value="24">24 - Guelma</SelectItem>
                <SelectItem value="25">25 - Constantine</SelectItem>
                <SelectItem value="26">26 - Médéa</SelectItem>
                <SelectItem value="27">27 - Mostaganem</SelectItem>
                <SelectItem value="28">28 - M'Sila</SelectItem>
                <SelectItem value="29">29 - Mascara</SelectItem>
                <SelectItem value="30">30 - Ouargla</SelectItem>
                <SelectItem value="31">31 - Oran</SelectItem>
                <SelectItem value="32">32 - El Bayadh</SelectItem>
                <SelectItem value="33">33 - Illizi</SelectItem>
                <SelectItem value="34">34 - Bordj Bou Arréridj</SelectItem>
                <SelectItem value="35">35 - Boumerdès</SelectItem>
                <SelectItem value="36">36 - El Tarf</SelectItem>
                <SelectItem value="37">37 - Tindouf</SelectItem>
                <SelectItem value="38">38 - Tissemsilt</SelectItem>
                <SelectItem value="39">39 - El Oued</SelectItem>
                <SelectItem value="40">40 - Khenchela</SelectItem>
                <SelectItem value="41">41 - Souk Ahras</SelectItem>
                <SelectItem value="42">42 - Tipaza</SelectItem>
                <SelectItem value="43">43 - Mila</SelectItem>
                <SelectItem value="44">44 - Aïn Defla</SelectItem>
                <SelectItem value="45">45 - Naâma</SelectItem>
                <SelectItem value="46">46 - Aïn Témouchent</SelectItem>
                <SelectItem value="47">47 - Ghardaïa</SelectItem>
                <SelectItem value="48">48 - Relizane</SelectItem>
                <SelectItem value="49">49 - El M'Ghair</SelectItem>
                <SelectItem value="50">50 - El Meniaa</SelectItem>
                <SelectItem value="51">51 - Ouled Djellal</SelectItem>
                <SelectItem value="52">52 - Bordj Badji Mokhtar</SelectItem>
                <SelectItem value="53">53 - Béni Abbès</SelectItem>
                <SelectItem value="54">54 - Timimoun</SelectItem>
                <SelectItem value="55">55 - Touggourt</SelectItem>
                <SelectItem value="56">56 - Djanet</SelectItem>
                <SelectItem value="57">57 - In Salah</SelectItem>
                <SelectItem value="58">58 - In Guezzam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "dropdown":
        return (
          <div className="space-y-2">
            <div className="space-y-2">
              {question.choix?.map((choix, index) => (
                <div key={index} className="flex items-center space-x-2 group">
                  <div className="flex items-center flex-grow">
                    <Input
                      value={choix}
                      onChange={(e) =>
                        modifierChoix(
                          sectionIndex,
                          indexQuestion,
                          index,
                          e.target.value
                        )
                      }
                      className="flex-grow"
                      placeholder="option"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() =>
                        supprimerChoix(sectionIndex, indexQuestion, index)
                      }
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 cursor-pointer"
                onClick={() => ajouterChoix(sectionIndex, indexQuestion)}
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-sm">Ajouter une nouvelle option</span>
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez une option" />
              </SelectTrigger>
              <SelectContent>
                {question.choix?.map((choix, index) => (
                  <SelectItem key={index} value={choix || `option-${index}`}>
                    {choix}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return <Input placeholder="Votre réponse" />;
    }
  };

  const handleDialogClose = () => {
    setStep("selection");
    setTimeout(() => {
      setDate(undefined);
    }, 300);
  };

  const handleDialogCloseWithRedirect = () => {
    handleDialogClose();
    setTimeout(() => {
      router.push('/home');
    }, 500);
  };

  const getLink = async () => {
    try {
      const dateTime = getDateTime(); // Get the combined date and time
      const formId = await handleSubmitForm(false, dateTime); // Pass dateTime to handleSubmitForm

      if (formId) {
        setStep("link");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la publication");
      console.error("Publication error:", error);
    }
  };

  const handleCopy = () => {
    if (formLink) {
      const fullLink = `http://localhost:3000/form/${formLink}`;
      navigator.clipboard.writeText(fullLink);
      toast.success("Lien copié dans le presse-papiers");
    }
  };

  const [showSaveDialog, setShowSaveDialog] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center m-6 px-4 max-w-7xl mx-auto gap-4">
        <div className="flex gap-4">
          <button onClick={() => {
            setShowSaveDialog(true)
          }}><Logo className="h-[70px] w-auto text-blue-600" /></button>
          <div className="h-[70px] flex flex-col justify-center">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-0.5">Formulaire</h1>
            <p className="text-xs text-gray-500">
              Générez des formulaires efficacement et rapidement avec l'I.A.
            </p>
          </div>
        </div>

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sauvegarder le formulaire</DialogTitle>
              <DialogDescription>
                Voulez-vous sauvegarder ce formulaire en tant que brouillon avant de continuer ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setShowSaveDialog(false);
                  router.push("/home?section=create");
                }}
              >
                Non
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={saveAsDraft}
              >
                Oui
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex space-x-2 w-full md:w-auto">
          <Button
            variant="secondary"
            size="sm"
            className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            onClick={saveAsDraft}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>

          {/* This component displays the toasts */}
          <Toaster position="top-center" richColors />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >Publier</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              {step === "selection" ? (
                // Initial content for date selection
                <>
                  <DialogHeader>
                    <DialogTitle>Gérer les accès de publication</DialogTitle>
                    <DialogDescription>
                      Utilisez ces paramètres pour contrôler la Date et l'Heure de Fin de ce Formulaire
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    {/* Date Selection */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="date-picker">Date de fin *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date-picker"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date ? "text-red-500 border-red-500" : "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date (obligatoire)</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      {!date && <p className="text-sm text-red-500">Une date doit être sélectionnée</p>}
                    </div>

                    {/* Time Selection */}
                    <div className="flex flex-col gap-2">
                      <Label>Heure de fin *</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                          <Select
                            value={time.hours}
                            onValueChange={(value) => setTime(prev => ({ ...prev, hours: value }))}
                          >
                            <SelectTrigger className={cn(
                              "w-20",
                              !time.hours ? "border-red-500" : ""
                            )}>
                              <SelectValue placeholder="HH" />
                            </SelectTrigger>
                            <SelectContent>
                              {hourOptions.map((hour) => (
                                <SelectItem key={hour} value={hour}>
                                  {hour}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">:</span>
                          <Select
                            value={time.minutes}
                            onValueChange={(value) => setTime(prev => ({ ...prev, minutes: value }))}
                          >
                            <SelectTrigger className={cn(
                              "w-20",
                              !time.minutes ? "border-red-500" : ""
                            )}>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {minuteOptions.map((minute) => (
                                <SelectItem key={minute} value={minute}>
                                  {minute}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {(!time.hours || !time.minutes) && (
                        <p className="text-sm text-red-500">L'heure et les minutes doivent être sélectionnées</p>
                      )}
                    </div>

                    {/* Preview of selected date and time */}
                    {date && time.hours && time.minutes && (
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Date et heure de fin sélectionnées :</strong>
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          {format(date, "EEEE d MMMM yyyy", { locale: fr })} à {time.hours}:{time.minutes}
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={getLink}
                      disabled={!date || !time.hours || !time.minutes || isSubmitting}
                    >
                      {isSubmitting ? "Publication..." : "Publier"}
                    </Button>
                  </DialogFooter>
                </>
              ) : (
                // Content for link sharing
                <>
                  <DialogHeader>
                    <DialogTitle>Partager le lien</DialogTitle>
                    <DialogDescription>
                      Toute personne disposant de ce lien pourra remplir le formulaire.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="link" className="sr-only">
                        Link
                      </Label>
                      <Input
                        id="link"
                        ref={inputRef}
                        defaultValue={`http://localhost:3000/form/${formLink}`}
                        readOnly
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="px-3 bg-blue-600 hover:bg-blue-700"
                      onClick={handleCopy}
                    >
                      <span className="sr-only">Copy</span>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="bg-slate-100 hover:bg-slate-200 text-sm text-black"
                        onClick={handleDialogCloseWithRedirect}
                      >
                        Fermer
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="my-6">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            {/* Main form content */}
            <div className="flex-1 order-2 lg:order-1">
              <div className="bg-white border rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <Input
                    value={titreFormulaire}
                    onChange={(e) => setTitreFormulaire(e.target.value)}
                    placeholder="Formulaire sans titre"
                    className="text-2xl font-bold border-none focus:outline-none focus:ring-0 px-3 py-1"
                  />
                </div>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du formulaire"
                  className="text-sm text-gray-500 border-none focus:outline-none focus:ring-0 px-3 py-1"
                />
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4 mt-4"
                    >
                      {sections.map((section, indexSection) => (
                        <Draggable
                          key={section.id}
                          draggableId={`section-${section.id}`}
                          index={indexSection}
                        >
                          {(providedDraggable) => (
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              className={`bg-white border rounded-lg shadow-sm relative ${sectionActive === indexSection
                                ? "border-blue-500 border-2"
                                : ""
                                }`}
                              onClick={() => {
                                setSectionActive(indexSection);
                                setQuestionActive(0);
                              }}
                            >
                              <div
                                {...providedDraggable.dragHandleProps}
                                className="
                                  absolute 
                                  left-2 top-1/2 
                                  -translate-y-1/2 
                                  cursor-move 
                                  text-gray-400 hover:text-gray-600
                                  md:left-4
                                  lg:absolute lg:left-[-24px] lg:top-1/2 lg:-translate-y-1/2
                                  xl:left-[-28px]
                                  2xl:left-[-32px]
                                "
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>

                              <div className="p-4 border-b flex justify-between items-center">
                                <Input
                                  value={section.nom}
                                  onChange={(e) => {
                                    const sectionsMisesAJour = [...sections];
                                    sectionsMisesAJour[indexSection].nom =
                                      e.target.value;
                                    setSections(sectionsMisesAJour);
                                  }}
                                  placeholder="Nom de la section"
                                  className="text-lg font-semibold border-none focus:outline-none focus:ring-0 px-3 py-1 flex-grow"
                                />
                                <div className="flex items-center space-x-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 ml-2"
                                          onClick={() =>
                                            ajouterQuestion(indexSection)
                                          }
                                        >
                                          <PlusCircleIcon className="h-5 w-5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-200 text-gray-800 px-3 py-2 rounded-md shadow-lg text-sm border-none">
                                        <p>Ajouter une question</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  {sections.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                      onClick={() =>
                                        supprimerSection(indexSection)
                                      }
                                    >
                                      <Delete className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="p-4 space-y-4">
                                {section.questions.map(
                                  (question, indexQuestion) => (
                                    <div
                                      key={question.id}
                                      ref={(el) => {
                                        if (el) {
                                          const refs = questionRefs.current;
                                          if (!refs[indexQuestion]) {
                                            refs[indexQuestion] = el;
                                          }
                                        }
                                      }}
                                      className={`border rounded p-4 ${sectionActive === indexSection && questionActive === indexQuestion ? 'border-blue-400' : ''
                                        }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSectionActive(indexSection);
                                        setQuestionActive(indexQuestion);
                                      }}
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center space-x-2">
                                          <div className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`obligatoire-${indexSection}-${indexQuestion}`}
                                              checked={question.obligatoire}
                                              onCheckedChange={(checked) => {
                                                const sectionsMisesAJour = [
                                                  ...sections,
                                                ];
                                                sectionsMisesAJour[
                                                  indexSection
                                                ].questions[
                                                  indexQuestion
                                                ].obligatoire =
                                                  Boolean(checked);
                                                setSections(
                                                  sectionsMisesAJour
                                                );
                                              }}
                                              className="border-blue-600 data-[state=checked]:bg-blue-600"
                                            />
                                            <label
                                              htmlFor={`obligatoire-${indexSection}-${indexQuestion}`}
                                              className="text-sm cursor-pointer"
                                            >
                                              Obligatoire
                                            </label>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Select
                                            value={question.type}
                                            onValueChange={(
                                              value: QuestionType
                                            ) =>
                                              modifierTypeQuestion(
                                                indexSection,
                                                indexQuestion,
                                                value
                                              )
                                            }
                                          >
                                            <SelectTrigger className="w-[180px]">
                                              <SelectValue placeholder="Type de question" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="question courte">Question courte</SelectItem>
                                              <SelectItem value="question longue">Question longue</SelectItem>
                                              <SelectItem value="document">Document</SelectItem>
                                              <SelectItem value="numéro de téléphone">Numéro de téléphone</SelectItem>
                                              <SelectItem value="nombre">Nombre</SelectItem>
                                              <SelectItem value="choix unique">Choix unique</SelectItem>
                                              <SelectItem value="date">Date</SelectItem>
                                              <SelectItem value="dropdown">Liste déroulante</SelectItem>
                                              <SelectItem value="email">Email</SelectItem>
                                              <SelectItem value="wilaya">Wilaya</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          {section.questions.length > 1 && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                supprimerQuestion(indexSection, indexQuestion);
                                              }}
                                            >
                                              <Delete className="h-4 w-4" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>

                                      <div className="mb-4 w-full">
                                        <textarea
                                          value={question.titre}
                                          onChange={(e) => {
                                            const sectionsMisesAJour = [
                                              ...sections,
                                            ];
                                            sectionsMisesAJour[
                                              indexSection
                                            ].questions[indexQuestion].titre =
                                              e.target.value;
                                            setSections(sectionsMisesAJour);
                                          }}
                                          className="w-full min-h-[60px] text-sm font-medium p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          placeholder="Question"
                                        />
                                      </div>

                                      {rendreChampQuestion(
                                        question,
                                        indexSection,
                                        indexQuestion
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* Sidebar controls*/}
            <div className="lg:w-64 space-y-4 order-1 lg:order-2 sticky top-6 self-start h-fit">
              <Button
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                onClick={ajouterSection}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Ajouter une section
              </Button>
              <Button
                variant="outline"
                className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                onClick={() => setShowChat(true)}
              >
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Générer avec l'I.A.
              </Button>

              <Dialog open={showChat} onOpenChange={setShowChat}>
                <DialogContent className="!max-w-3xl p-6 rounded-lg shadow-lg">
                  <DialogHeader>
                    <DialogTitle>AI Chat</DialogTitle>
                    <DialogDescription>
                      Utiliser l’AI pour generer votre formulaire
                    </DialogDescription>
                  </DialogHeader>
                  <AIChatDialog
                    currentForm={{
                      categories: sections.map(section => ({
                        category_name: section.nom,
                        questions: section.questions.map(question => ({
                          question_text: question.titre,
                          question_type: determineQuestionType(question.type),
                          answer_type: question.type,
                          required: question.obligatoire,
                          choices: question.choix,
                        }))
                      })),
                      form_name: titreFormulaire,
                      form_description: description,
                    }}
                    onFormGenerated={handleFormGenerated}
                  />
                </DialogContent>
              </Dialog>

              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <Checkbox
                  id="all-required"
                  checked={sections.every((section) =>
                    section.questions.every(
                      (question) => question.obligatoire
                    )
                  )}
                  onCheckedChange={(checked: CheckedState) => {
                    const sectionsMisesAJour = sections.map((section) => ({
                      ...section,
                      questions: section.questions.map((question) => ({
                        ...question,
                        obligatoire: Boolean(checked),
                      })),
                    }));
                    setSections(sectionsMisesAJour);
                  }}
                  className="border-blue-600 data-[state=checked]:bg-blue-600"
                />
                <label
                  htmlFor="all-required"
                  className="text-sm cursor-pointer"
                >
                  Toutes les questions obligatoires
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormulaireConstructeur;