"use client";

import React from 'react';
import HomePageHeader from "@/components/HomePageHeader";
import { useState, useEffect } from "react";
import AdminEmptyFormsView from "./AdminEmptyFormsView";
import AdminFormsListView from "./AdminFormsListView";

type Form = {
    id: number;
    form_name: string;
    form_description: string;
};

export default function AdminPage() {
    const [forms, setForms] = useState<Form[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublishedForms = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const userString = localStorage.getItem("user");
                if (!userString) {
                    throw new Error("No user found in localStorage");
                }

                const userObject = JSON.parse(userString);

                if (userObject.role?.toLowerCase().trim() !== "admin") {
                    throw new Error("User is not an admin");
                }

                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await fetch('https://projuniv-backend.onrender.com/forms/published', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Set the forms data
                setForms(Array.isArray(data) ? data : []);

            } catch (error: any) {
                console.error("Error fetching published forms:", error);
                setError(error.message || "Failed to load published forms");
                setForms([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublishedForms();
    }, []);

    // Handler to remove a form from the list after successful deletion
    const handleFormDelete = (deletedFormId: number) => {
        setForms(prevForms => prevForms.filter(form => form.id !== deletedFormId));
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <p>Loading forms...</p>
            );
        }

        if (error) {
            return (
                <div className="text-red-500 py-4">
                    Erreur: {error}
                </div>
            );
        }

        if (forms.length === 0) {
            return <AdminEmptyFormsView />;
        }

        return (
            <AdminFormsListView
                forms={forms}
                onFormDelete={handleFormDelete}
            />
        );
    };

    return (
        <main className="container mx-auto px-2 sm:px-4 flex flex-col">
            <HomePageHeader
                title='Administrateur'
                description='Bienvenu dans votre espace !'
            />

            <hr className="mb-6 border-t border-muted" />

            {renderContent()}
        </main>
    );
}