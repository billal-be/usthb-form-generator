'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LoadingAnimation from "@/components/LoadingAnimation";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Send, Sparkles, Bot, User } from "lucide-react";
import Logo from '@/components/Logo';

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

const AIChatPage = () => {
    const getUser = (): string | null => {
        try {
            const userDataString = localStorage.getItem("user");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                return userData.username;
            }
            return null;
        } catch (error) {
            console.error("Error getting user from localStorage:", error);
            return null;
        }
    };

    const username = getUser();
    const [messages, setMessages] = useState([
        {
            sender: 'AI',
            text: `Salut${username ? ` ${username}` : ' '} ! Je suis ton assistant IA, ici pour t'aider à créer un nouveau formulaire à partir de zéro. Il te suffit de décrire ce dont tu as besoin.`
        }
    ]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isSending) return;

        const userMessage = input.trim();
        setInput('');
        setIsSending(true);

        setMessages(prev => [...prev, { sender: 'User', text: userMessage }]);

        try {
            const payload = !conversationId ? { prompt: userMessage } : { conversation_id: conversationId, prompt: userMessage };

            //const res = await axios.post("https://syyklo.pythonanywhere.com/chat", payload);
            const res = await axios.post("http://localhost:4000/chat", payload);

            const { conversation_id, question } = res.data;
            setConversationId(conversation_id);
            setMessages(prev => [...prev, { sender: 'AI', text: question }]);
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Erreur lors de l'envoi du message");
        } finally {
            setIsSending(false);
        }
    };

    const router = useRouter();
    const handleGenerate = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = input.trim();
        setInput('');
        setIsGenerating(true);

        setMessages(prev => [...prev, { sender: 'User', text: userMessage }]);

        try {
            const payload = !conversationId
                ? { context: userMessage }
                : { conversation_id: conversationId, context: userMessage };

            const res = await axios.post("http://localhost:4000/generate", payload);
            const generatedForm: Form = res.data;

            localStorage.setItem("generatedForm", JSON.stringify(generatedForm));

            router.push("/home/ai-chat/create-form");

        } catch (error) {
            console.error("Error generating form:", error);
            toast.error("Erreur lors de la génération du formulaire");
        } finally {
            setIsGenerating(false);
        }
    };



    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    return (
        <main className="container mx-auto p-6 sm:px-4 flex flex-col h-screen max-w-7xl">
            {/* Loading Animation Overlay */}
            {isGenerating && <LoadingAnimation />}

            <div className="flex gap-4">
                <button onClick={() => { router.push("/home?section=create"); }}><Logo className="h-[70px] w-auto text-blue-600" /></button>
                <div className="h-[70px] flex flex-col justify-center">
                    <h1 className="text-2xl font-extrabold text-gray-800 mb-0.5">Assistant IA</h1>
                    <p className="text-xs text-gray-500">
                        Créez des formulaires professionnels avec l'intelligence artificielle
                    </p>
                </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.sender === 'AI' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'AI'
                                    ? 'bg-gray-50 text-gray-800 rounded-tl-md'
                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-md'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.text}
                                </p>
                            </div>

                            {msg.sender === 'User' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading indicator for AI response */}
                    {isSending && (
                        <div className="flex gap-3 justify-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all duration-200">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                adjustTextareaHeight();
                            }}

                            placeholder="Décrivez le formulaire que vous souhaitez créer..."
                            className="w-full resize-none border-none shadow-none bg-transparent placeholder:text-gray-400 focus-visible:ring-0 text-sm leading-relaxed min-h-[48px]"
                            disabled={isGenerating || isSending}
                            rows={1}
                        />

                        <div className="flex items-center justify-end p-3 pt-0">
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSend}
                                    variant="ghost"
                                    size="sm"
                                    disabled={!input.trim() || isGenerating || isSending}
                                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <Send className="w-4 h-4 mr-1" />
                                    Chatter
                                </Button>

                                <Button
                                    onClick={handleGenerate}
                                    size="sm"
                                    disabled={!input.trim() || isGenerating || isSending}
                                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    {isGenerating ? 'Génération...' : 'Générer le formulaire'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AIChatPage;