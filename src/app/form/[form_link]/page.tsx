
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useRouter } from 'next/router';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";


type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};

type Choice = {
  id: number;
  text: string;
};

type Question = {
  id: number;
  question_text: string;
  question_type: string;
  answer_type: string;
  required: boolean;
  choices: Choice[];
  answer?: string;
};

type Category = {
  id: number;
  category_name: string;
  questions: Question[];
};

type FormData = {
  id: number;
  form_name: string;
  form_type: string;
  form_description?: string;
  form_link?: string;
  deadline?: string;
  visibility?: string;
  draft?: boolean;
  user?: User;
  categories: Category[];
};

type SubmissionResponse = {
  sessionId: string;
  responses: Array<{
    questionId: number;
    sessionId: string;
    answer: string;
    formId: number;
    filePath: string | null;
    id: number;
  }>;
};

export default function FormPage() {
  const { form_link } = useParams();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(true);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [fileAnswers, setFileAnswers] = useState<{ [key: number]: File | null }>({});
  const [captchaValue, setCaptchaValue] = useState<string>("");
  const [userCaptchaInput, setUserCaptchaInput] = useState<string>("");
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [invalidFields, setInvalidFields] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionProgress, setSubmissionProgress] = useState<string>("");
  const [showCaptchaDialog, setShowCaptchaDialog] = useState<boolean>(false);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };


  const isDeadlinePassed = (): boolean => {
    if (!formData?.deadline) return false;

    const currentDate = new Date();
    const deadlineDate = new Date(formData.deadline);

    return currentDate > deadlineDate;
  };
  if (!formLoading && formData && isDeadlinePassed()) {
    if (typeof window !== 'undefined') {
      window.location.href = `/form/${form_link}/deadline-passed`;
    }
    return null;
  }

  const isFileQuestion = (question: Question): boolean => {
    return question.question_type === 'document' ||
      question.answer_type === 'document' ||
      question.answer_type === 'pdf';
  };

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch(`https://projuniv-backend.onrender.com/forms/link/${form_link}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch form data');
        }

        const data: FormData = await response.json();
        setFormData(data);

        const initialAnswers: { [key: number]: any } = {};
        const initialFileAnswers: { [key: number]: File | null } = {};

        data.categories.forEach(category => {
          category.questions.forEach(question => {

            if (isFileQuestion(question)) {
              initialFileAnswers[question.id] = null;
            } else {
              initialAnswers[question.id] = '';


              if (question.answer_type === 'choix multiple') {
                initialAnswers[question.id] = [];
              }
            }
          });
        });

        setAnswers(initialAnswers);
        setFileAnswers(initialFileAnswers);

        setCaptchaValue(generateCaptcha());
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setFormLoading(false);
      }
    };

    if (form_link) {
      fetchFormData();
    }
  }, [form_link]);


  const handleInputChange = (questionId: number, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    if (invalidFields.includes(questionId)) {
      setInvalidFields(prev => prev.filter(id => id !== questionId));
    }
  };


  const handleFileUpload = (questionId: number, files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];


      setFileAnswers(prev => ({
        ...prev,
        [questionId]: file
      }));


      if (invalidFields.includes(questionId)) {
        setInvalidFields(prev => prev.filter(id => id !== questionId));
      }
    } else {

      setFileAnswers(prev => ({
        ...prev,
        [questionId]: null
      }));
    }
  };


  const uploadFiles = async (sessionId: string, formId: number) => {
    const fileQuestionIds = Object.keys(fileAnswers).filter(
      id => fileAnswers[parseInt(id)] !== null
    );

    if (fileQuestionIds.length === 0) {
      return true;
    }


    for (const questionId of fileQuestionIds) {
      setSubmissionProgress(`Uploading file for question ${questionId}...`);

      const file = fileAnswers[parseInt(questionId)];
      if (!file) continue;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      formData.append('formId', formId.toString());
      formData.append('questionId', questionId);

      try {
        const response = await fetch('https://projuniv-backend.onrender.com/submit-response', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error(`Failed to upload file for question ${questionId}`);
          return false;
        }

        const result = await response.json();
        console.log(`File uploaded successfully for question ${questionId}:`, result);
      } catch (error) {
        console.error(`Error uploading file for question ${questionId}:`, error);
        return false;
      }
    }

    return true;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);



    if (userCaptchaInput !== captchaValue) {
      setShowCaptchaDialog(true);
      setCaptchaValue(generateCaptcha());
      setUserCaptchaInput("");
      return;
    }



    const newInvalidFields: number[] = [];
    let hasInvalidFields = false;

    if (formData) {
      formData.categories.forEach(category => {
        category.questions.forEach(question => {
          if (question.required) {

            if (isFileQuestion(question)) {
              if (!fileAnswers[question.id]) {
                newInvalidFields.push(question.id);
                hasInvalidFields = true;
              }
            }

            else if (
              answers[question.id] === '' ||
              answers[question.id] === null ||
              answers[question.id] === undefined ||
              (Array.isArray(answers[question.id]) && answers[question.id].length === 0)
            ) {
              newInvalidFields.push(question.id);
              hasInvalidFields = true;
            }
          }
        });
      });
    }

    setInvalidFields(newInvalidFields);

    if (hasInvalidFields) {
      alert("Please fill in all required fields.");
      return;
    }


    try {
      setIsSubmitting(true);
      setSubmissionProgress("Submitting text responses...");

      if (!formData) {
        throw new Error('Form data not available');
      }


      const responsesData = Object.entries(answers)
        .filter(([questionId, value]) => {

          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value !== '' && value !== null && value !== undefined;
        })
        .map(([questionId, value]) => {
          const qId = parseInt(questionId);

          let formattedValue = "";
          if (Array.isArray(value)) {

            formattedValue = value.join(', ');
          } else if (value instanceof Date) {
            formattedValue = format(value, 'yyyy-MM-dd');
          } else {
            formattedValue = String(value);
          }

          return {
            answer: formattedValue,
            form: {
              id: formData.id
            },
            question: {
              id: qId
            }
          };
        });

      console.log('Sending responses data:', responsesData);


      const response = await fetch('https://projuniv-backend.onrender.com/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(responsesData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to submit form responses: ${response.status} ${response.statusText}`);
      }

      const responseData: SubmissionResponse = await response.json();
      console.log("Text responses submitted successfully:", responseData);


      const sessionId = responseData.sessionId;

      if (Object.values(fileAnswers).some(file => file !== null)) {
        setSubmissionProgress("Uploading files...");
        const filesUploaded = await uploadFiles(sessionId, formData.id);

        if (!filesUploaded) {
          throw new Error('Failed to upload some files');
        }
      }


      window.location.href = `${window.location.pathname}/submission-success`;


    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Failed to submit form: ${error instanceof Error ? error.message : 'Please try again later.'}`);
    } finally {
      setIsSubmitting(false);
      setSubmissionProgress("");
    }
  };


  const renderQuestionInput = (question: Question) => {
    const isInvalid = invalidFields.includes(question.id);

    switch (question.answer_type) {
      case 'question courte':
        return (
          <Input
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={cn(isInvalid && "border-red-500 ring-2 ring-red-500")}
          />
        );

      case 'question longue':
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={cn(isInvalid && "border-red-500 ring-2 ring-red-500")}
            rows={4}
          />
        );

      case 'document':
        return (
          <Input
            type="file"
            onChange={(e) => handleFileUpload(question.id, e.target.files)}
            className={cn(isInvalid && "border-red-500 ring-2 ring-red-500")}
          />
        );

      case 'numéro de téléphone':
        return (
          <Input
            type="tel"
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={cn(isInvalid && "border-red-500 ring-2 ring-red-500")}
          />
        );

      case 'nombre':
        return (
          <Input
            type="number"
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={cn(isInvalid && "border-red-500 ring-2 ring-red-500")}
          />
        );

      case 'choix unique':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleInputChange(question.id, value)}
            className={cn("space-y-2", isInvalid && "border-red-500 p-2 rounded-md ring-2 ring-red-500")}
          >
            {question.choices.map(choice => (
              <div key={choice.id} className="flex items-center space-x-2">
                <RadioGroupItem value={choice.text} id={`${question.id}-${choice.id}`} />
                <Label htmlFor={`${question.id}-${choice.id}`}>{choice.text}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !answers[question.id] && "text-muted-foreground",
                  isInvalid && "border-red-500 ring-2 ring-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {answers[question.id] ? format(answers[question.id], 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={answers[question.id]}
                onSelect={(date) => handleInputChange(question.id, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'dropdown':
        return (
          <Select
            onValueChange={(value) => handleInputChange(question.id, value)}
            value={answers[question.id] || ''}
          >
            <SelectTrigger className={cn(isInvalid && "border-red-500 ring-2 ring-red-500")}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.choices.map(choice => (
                <SelectItem key={choice.id} value={choice.text}>
                  {choice.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'wilaya':
        return (
          <Select
            onValueChange={(value) => handleInputChange(question.id, value)}
            value={answers[question.id] || ''}
          >
            <SelectTrigger className={cn(isInvalid && "border-red-500 ring-2 ring-red-500")}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Adrar">1 - Adrar</SelectItem>
              <SelectItem value="Chlef">2 - Chlef</SelectItem>
              <SelectItem value="Laghouat">3 - Laghouat</SelectItem>
              <SelectItem value="Oum El Bouaghi">4 - Oum El Bouaghi</SelectItem>
              <SelectItem value="Batna">5 - Batna</SelectItem>
              <SelectItem value="Béjaïa">6 - Béjaïa</SelectItem>
              <SelectItem value="Biskra">7 - Biskra</SelectItem>
              <SelectItem value="Béchar">8 - Béchar</SelectItem>
              <SelectItem value="Blida">9 - Blida</SelectItem>
              <SelectItem value="Bouira">10 - Bouira</SelectItem>
              <SelectItem value="Tamanrasset">11 - Tamanrasset</SelectItem>
              <SelectItem value="Tébessa">12 - Tébessa</SelectItem>
              <SelectItem value="Tlemcen">13 - Tlemcen</SelectItem>
              <SelectItem value="Tiaret">14 - Tiaret</SelectItem>
              <SelectItem value="Tizi Ouzou">15 - Tizi Ouzou</SelectItem>
              <SelectItem value="Alger">16 - Alger</SelectItem>
              <SelectItem value="Djelfa">17 - Djelfa</SelectItem>
              <SelectItem value="Jijel">18 - Jijel</SelectItem>
              <SelectItem value="Sétif">19 - Sétif</SelectItem>
              <SelectItem value="Saïda">20 - Saïda</SelectItem>
              <SelectItem value="Skikda">21 - Skikda</SelectItem>
              <SelectItem value="Sidi Bel Abbès">22 - Sidi Bel Abbès</SelectItem>
              <SelectItem value="Annaba">23 - Annaba</SelectItem>
              <SelectItem value="Guelma">24 - Guelma</SelectItem>
              <SelectItem value="Constantine">25 - Constantine</SelectItem>
              <SelectItem value="Médéa">26 - Médéa</SelectItem>
              <SelectItem value="Mostaganem">27 - Mostaganem</SelectItem>
              <SelectItem value="M'Sila">28 - M'Sila</SelectItem>
              <SelectItem value="Mascara">29 - Mascara</SelectItem>
              <SelectItem value="Ouargla">30 - Ouargla</SelectItem>
              <SelectItem value="Oran">31 - Oran</SelectItem>
              <SelectItem value="El Bayadh">32 - El Bayadh</SelectItem>
              <SelectItem value="Illizi">33 - Illizi</SelectItem>
              <SelectItem value="Bordj Bou Arréridj">34 - Bordj Bou Arréridj</SelectItem>
              <SelectItem value="Boumerdès">35 - Boumerdès</SelectItem>
              <SelectItem value="El Tarf">36 - El Tarf</SelectItem>
              <SelectItem value="Tindouf">37 - Tindouf</SelectItem>
              <SelectItem value="Tissemsilt">38 - Tissemsilt</SelectItem>
              <SelectItem value="El Oued">39 - El Oued</SelectItem>
              <SelectItem value="Khenchela">40 - Khenchela</SelectItem>
              <SelectItem value="Souk Ahras">41 - Souk Ahras</SelectItem>
              <SelectItem value="Tipaza">42 - Tipaza</SelectItem>
              <SelectItem value="Mila">43 - Mila</SelectItem>
              <SelectItem value="Aïn Defla">44 - Aïn Defla</SelectItem>
              <SelectItem value="Naâma">45 - Naâma</SelectItem>
              <SelectItem value="Aïn Témouchent">46 - Aïn Témouchent</SelectItem>
              <SelectItem value="Ghardaïa">47 - Ghardaïa</SelectItem>
              <SelectItem value="Relizane">48 - Relizane</SelectItem>
              <SelectItem value="El M'Ghair">49 - El M'Ghair</SelectItem>
              <SelectItem value="El Meniaa">50 - El Meniaa</SelectItem>
              <SelectItem value="Ouled Djellal">51 - Ouled Djellal</SelectItem>
              <SelectItem value="Bordj Badji Mokhtar">52 - Bordj Badji Mokhtar</SelectItem>
              <SelectItem value="Béni Abbès">53 - Béni Abbès</SelectItem>
              <SelectItem value="Timimoun">54 - Timimoun</SelectItem>
              <SelectItem value="Touggourt">55 - Touggourt</SelectItem>
              <SelectItem value="Djanet">56 - Djanet</SelectItem>
              <SelectItem value="In Salah">57 - In Salah</SelectItem>
              <SelectItem value="In Guezzam">58 - In Guezzam</SelectItem>
            </SelectContent>
          </Select>
        );

      case 'email':
        return (
          <Input
            type="email"
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className={cn(isInvalid && "border-red-500 ring-2 ring-red-500")}
          />
        );
    }
  };

  if (formLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Form Not Found</CardTitle>
            <CardDescription>The form you're looking for does not exist or has been removed.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{formData.form_name || "Untitled form"}</CardTitle>
          <CardDescription>
            {formData.form_description || "Please complete the form below"}
          </CardDescription>
          {formData.deadline && (
            <div className={cn(
              "mt-2 p-2 rounded-md text-sm",
              isDeadlinePassed()
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-blue-100 text-blue-800 border border-blue-300"
            )}>
              <strong>Deadline:</strong> {format(new Date(formData.deadline), 'PPP à HH:mm')}
              {isDeadlinePassed() && (
                <span className="block mt-1 font-semibold">
                  This form is no longer accepting submissions.
                </span>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit}>
        {formData.categories.map((category) => (
          <Card key={category.id} className="mb-6">
            <CardHeader>
              <CardTitle>{category.category_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {category.questions.map(question => (
                <div key={question.id} className="space-y-2">
                  <Label className="flex items-center">
                    {question.question_text}
                    {question.required && <span className="ml-1 text-red-500">*</span>}
                  </Label>
                  {renderQuestionInput(question)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}


        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Verification</CardTitle>
            <CardDescription>Please enter the text you see below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-100 p-4 text-center text-2xl font-mono tracking-widest select-none">
              {captchaValue}
            </div>
            <Input
              value={userCaptchaInput}
              onChange={(e) => setUserCaptchaInput(e.target.value)}
              placeholder="Type the code you see above"
              className={cn(submitAttempted && userCaptchaInput !== captchaValue && "border-red-500 ring-2 ring-red-500")}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting || isDeadlinePassed()}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                {submissionProgress || "Submitting..."}
              </>
            ) : isDeadlinePassed() ? (
              "Submission Closed"
            ) : (
              "Submit"
            )}
          </Button>

          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Reset Form
          </Button>
        </div>
      </form>
      <Dialog open={showCaptchaDialog} onOpenChange={setShowCaptchaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CAPTCHA Incorrect</DialogTitle>
            <DialogDescription>
              The verification code you entered is incorrect. Please try again with the new code.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}