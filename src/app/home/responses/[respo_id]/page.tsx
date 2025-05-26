"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterIcon, Download, FileText } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface Answer {
  questionId: string | number;
  questionText: string;
  answerType: string;
  response: string;
}

interface Session {
  sessionId: string;
  answers: Answer[];
}

interface Question {
  id: string | number;
  text: string;
  type?: string;
}

const Page = () => {
  const { respo_id } = useParams();
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [questionMap, setQuestionMap] = useState<Record<string, string>>({});
  const [selectedQuestions, setSelectedQuestions] = useState<Record<string, boolean>>({});
  const [tempSelectedQuestions, setTempSelectedQuestions] = useState<Record<string, boolean>>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [formName, setFormName] = useState<string>('');
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Récupérer le nom du formulaire depuis les query parameters
  useEffect(() => {
    const nameFromParams = searchParams.get('name');
    if (nameFromParams) {
      setFormName(decodeURIComponent(nameFromParams));
    } else {
      setFormName(`Formulaire ${respo_id}`);
    }
  }, [searchParams, respo_id]);

  // Fonction pour récupérer les questions du formulaire
  const fetchFormQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`https://projuniv-backend.onrender.com/forms/${respo_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

      const formData = await res.json();
      console.log("Données du formulaire:", formData);

      // Extraire les questions du formulaire depuis les categories
      const map: Record<string, string> = {};

      // Le formData peut être un array ou un objet
      const data = Array.isArray(formData) ? formData[0] : formData;

      if (data && data.categories && Array.isArray(data.categories)) {
        data.categories.forEach((category: any) => {
          if (category.questions && Array.isArray(category.questions)) {
            category.questions.forEach((question: any) => {
              const key = String(question.id);
              map[key] = question.question_text;
            });
          }
        });
      }

      console.log("Questions extraites:", map);
      setQuestionMap(map);

      // Initialiser les questions sélectionnées
      const selected: Record<string, boolean> = {};
      Object.keys(map).forEach((id) => {
        selected[id] = false;
      });
      setSelectedQuestions(selected);
      setTempSelectedQuestions(selected);

    } catch (err) {
      console.error("Erreur de chargement des questions:", err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://projuniv-backend.onrender.com/responses/form/${respo_id}/sessions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error(`Erreur API: ${res.status}`);

        const data = await res.json();
        console.log("Données récupérées:", data);

        const adaptedSessions = data.map((session: any) => ({
          sessionId: session.sessionId,
          answers: session.responses || session.answers || [],
        }));

        setSessions(adaptedSessions);

        // Si on a des réponses, on peut aussi mettre à jour le questionMap avec les questions des réponses
        // mais on garde priorité aux questions du formulaire original
        const responseMap: Record<string, string> = {};
        adaptedSessions.forEach((session: { answers: any[]; }) => {
          session.answers.forEach((resp) => {
            const key = String(resp.questionId);
            if (!responseMap[key]) {
              responseMap[key] = resp.questionText;
            }
          });
        });

        // Fusionner avec les questions existantes (priorité aux questions du formulaire)
        setQuestionMap(prev => ({ ...responseMap, ...prev }));

      } catch (err) {
        console.error("Erreur de chargement des réponses:", err);
      }
    };

    if (respo_id) {
      // Récupérer d'abord les questions du formulaire, puis les réponses
      fetchFormQuestions().then(() => {
        fetchResponses();
      });
    }
  }, [respo_id]);

  const toggleTempField = (id: string) => {
    setTempSelectedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Fonction pour gérer les téléchargements de fichiers (PDF et documents)
  const handleFileDownload = (url: string, type: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleExcelDownload = async () => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`https://projuniv-backend.onrender.com/forms/${respo_id}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `form_${respo_id}_responses.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors du téléchargement Excel:', error);
      alert('Erreur lors du téléchargement du fichier Excel');
    } finally {
      setIsDownloading(false);
    }
  };

  // Fonction pour ouvrir le modal avec les sélections actuelles
  const openFilterModal = () => {
    setTempSelectedQuestions({ ...selectedQuestions });
    setShowFilterModal(true);
  };

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    const selectedCount = Object.values(tempSelectedQuestions).filter(Boolean).length;
    if (selectedCount > 10) {
      alert('Vous ne pouvez sélectionner que 10 questions maximum.');
      return;
    }
    setSelectedQuestions({ ...tempSelectedQuestions });
    setHasAppliedFilters(true);
    setShowFilterModal(false);
  };

  const visibleQuestionIds = Object.keys(selectedQuestions).filter((id) => selectedQuestions[id]);
  const hasSelectedFields = visibleQuestionIds.length > 0;
  const tempSelectedCount = Object.values(tempSelectedQuestions).filter(Boolean).length;
  const router = useRouter();

  return (
    <div >
      {/* Header responsive */}
      <div className="flex flex-row items-start m-6 px-4 max-w-7xl mx-auto gap-4">
        <button onClick={() => { router.push("/home?section=forms"); }}><Logo className="h-[70px] w-auto text-blue-600" /></button>

        <div className="h-[70px] flex flex-col justify-center">
          <h1 className="text-2xl font-extrabold text-gray-800 mb-0.5">Formulaire</h1>
          <p className="text-xs text-gray-500">
            Générez des formulaires efficacement et rapidement avec l'I.A.
          </p>
        </div>
      </div>

      {/* Main content - responsive container */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b border-gray-200 gap-3">
            <div className="text-lg font-semibold text-gray-800 truncate">
              {formName || `Formulaire ${respo_id}`}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto shadow-sm"
                onClick={handleExcelDownload}
                disabled={isDownloading}
              >
                <Download size={16} />
                <span className="hidden sm:inline">{isDownloading ? 'Téléchargement...' : 'Télécharger toutes les réponses'}</span>
                <span className="sm:hidden">{isDownloading ? 'Téléchargement...' : 'Télécharger'}</span>
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 text-gray-700 text-sm flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto shadow-sm"
                onClick={openFilterModal}
                disabled={isLoadingQuestions}
              >
                <FilterIcon size={16} />
                <span className="hidden sm:inline">{isLoadingQuestions ? 'Chargement...' : 'Filtrer les champs par titre'}</span>
                <span className="sm:hidden">{isLoadingQuestions ? 'Chargement...' : 'Filtrer'}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {!hasAppliedFilters ? (
            <div className="mt-8 sm:mt-12 text-center bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-gray-200">
              <div className="inline-block bg-blue-50 p-3 rounded-full mb-6">
                <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full">
                  <FilterIcon size={20} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Cliquez sur "Filtrer les champs" pour afficher les réponses
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Sélectionnez les questions que vous souhaitez voir dans le tableau pour commencer l'analyse des réponses
              </p>
            </div>
          ) : hasSelectedFields ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Mobile view - Cards */}
              <div className="block lg:hidden">
                {sessions.length > 0 ? (
                  sessions.map((session, index) => (
                    <div key={session.sessionId} className={`p-6 ${index !== sessions.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <div className="text-xs font-semibold text-blue-600 mb-4 uppercase tracking-wide">
                        Session #{index + 1}
                      </div>
                      <div className="space-y-4">
                        {visibleQuestionIds.map((id) => {
                          const answer = session.answers.find((a) => String(a.questionId) === id);
                          return (
                            <div key={id} className="bg-gray-50 p-4 rounded-md">
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                {questionMap[id]}
                              </div>
                              <div className="text-sm text-gray-900">
                                {answer?.answerType === "pdf" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFileDownload(answer.response, 'pdf')}
                                    className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    <Download size={14} />
                                    Télécharger PDF
                                  </Button>
                                ) : answer?.answerType === "document" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFileDownload(answer.response, 'document')}
                                    className="flex items-center gap-2 text-green-600 border-green-300 hover:bg-green-50"
                                  >
                                    <FileText size={14} />
                                    Télécharger Document
                                  </Button>
                                ) : (
                                  <span className="break-words">{answer?.response || "Aucune réponse"}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-lg font-medium mb-2">Aucune réponse disponible</div>
                    <div className="text-sm">Il n'y a pas encore de réponses pour ce formulaire.</div>
                  </div>
                )}
              </div>

              {/* Desktop view - Enhanced Table */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                          Session
                        </th>
                        {visibleQuestionIds.map((id) => (
                          <th key={id} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                            <div className="truncate" title={questionMap[id]}>
                              {questionMap[id]}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessions.length > 0 ? (
                        sessions.map((session, index) => (
                          <tr key={session.sessionId} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                              #{index + 1}
                            </td>
                            {visibleQuestionIds.map((id) => {
                              const answer = session.answers.find((a) => String(a.questionId) === id);
                              return (
                                <td key={id} className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                  {answer?.answerType === "pdf" ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleFileDownload(answer.response, 'pdf')}
                                      className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 transition-colors"
                                    >
                                      <Download size={14} />
                                      PDF
                                    </Button>
                                  ) : answer?.answerType === "document" ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleFileDownload(answer.response, 'document')}
                                      className="flex items-center gap-2 text-green-600 border-green-300 hover:bg-green-50 transition-colors"
                                    >
                                      <FileText size={14} />
                                      Document
                                    </Button>
                                  ) : (
                                    <div className="break-words leading-relaxed" title={answer?.response || "Aucune réponse"}>
                                      {answer?.response ? (
                                        <span className="text-gray-900">{answer.response}</span>
                                      ) : (
                                        <span className="text-gray-400 italic">Aucune réponse</span>
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={visibleQuestionIds.length + 1} className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <div className="text-lg font-medium mb-2">Aucune réponse disponible</div>
                              <div className="text-sm">Il n'y a pas encore de réponses pour ce formulaire.</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 sm:mt-12 text-center bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-gray-200">
              <div className="inline-block p-3 rounded-full mb-6">
                <div className="bg-blue-700 text-white w-10 h-10 flex items-center justify-center rounded-full">
                  <FilterIcon size={20} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Aucun champ sélectionné
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Veuillez sélectionner au moins une question pour afficher les réponses dans le tableau
              </p>
              <Button
                variant="outline"
                onClick={openFilterModal}
                className="border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                Sélectionner des champs
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal responsive */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] flex flex-col mx-auto">
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold">Filtrer les champs</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-2">
              Choisissez les champs que vous voulez rendre visibles dans les réponses (maximum 10)
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-4 text-sm font-medium text-gray-700 flex-shrink-0 bg-blue-50 px-3 py-2 rounded-md">
              Questions sélectionnées: <span className="text-blue-600">{tempSelectedCount}/10</span>
            </div>

            {/* Zone scrollable pour les questions */}
            <div className="flex-1 overflow-y-auto pr-2 max-h-[400px]">
              {isLoadingQuestions ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-sm text-gray-500">Chargement des questions...</div>
                </div>
              ) : Object.keys(questionMap).length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-sm text-gray-500 mb-2">Aucune question trouvée</div>
                  <div className="text-xs text-gray-400">Vérifiez que le formulaire contient des questions</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(questionMap).map(([id, label]) => (
                    <div key={id} className="flex justify-between items-start border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start flex-1 min-w-0 pr-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 text-xs font-semibold">Q</span>
                        </div>
                        <span className="text-sm text-gray-700 break-words leading-relaxed" title={label}>
                          {label}
                        </span>
                      </div>
                      <Checkbox
                        checked={tempSelectedQuestions[id] || false}
                        onCheckedChange={() => {
                          if (!tempSelectedQuestions[id] && tempSelectedCount >= 10) {
                            alert('Vous ne pouvez sélectionner que 10 questions maximum.');
                            return;
                          }
                          toggleTempField(id);
                        }}
                        className="h-5 w-5 rounded flex-shrink-0 mt-1"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bouton fixe en bas */}
          <div className="flex justify-center w-full mt-6 pt-4 border-t border-gray-200 flex-shrink-0 gap-3">
            <Button
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 text-gray-700 flex-1 sm:flex-none sm:px-6"
              onClick={() => setShowFilterModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none sm:px-6"
              onClick={applyFilters}
              disabled={isLoadingQuestions || Object.keys(questionMap).length === 0}
            >
              Appliquer les filtres
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;