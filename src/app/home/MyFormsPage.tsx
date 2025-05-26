"use client";

import React from 'react';
import HomePageHeader from "@/components/HomePageHeader";
import { useState, useEffect } from "react";
import EmptyFormsView from "./EmptyFormsView";
import FormsListView from "./FormsListView";

export default function MyFormsPage() {
    const [hasPublishedForms, setHasPublishedForms] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user forms data
    useEffect(() => {
        const fetchUserForms = async () => {
            try {
                setIsLoading(true);

                // Get user from localStorage
                const userString = localStorage.getItem("user");
                if (!userString) {
                    console.error("No user found in localStorage");
                    setHasPublishedForms(false);
                    setIsLoading(false);
                    return;
                }

                // Parse user object to get the ID
                const userObject = JSON.parse(userString);
                const userId = userObject.id;

                if (!userId) {
                    console.error("No user ID found");
                    setHasPublishedForms(false);
                    setIsLoading(false);
                    return;
                }

                // Fetch published forms for the user
                const response = await fetch(`https://projuniv-backend.onrender.com/forms/user/${userId}/published`);
                const data = await response.json();

                // If we have any forms in the response, set hasPublishedForms to true
                setHasPublishedForms(Array.isArray(data) && data.length > 0);
            } catch (error) {
                setError("échec du chargement de vos formulaires publiés");
                setHasPublishedForms(false);
            } finally {
                setIsLoading(false);
            }
        };

        // Call the function to fetch forms when component mounts
        fetchUserForms();
    }, []);

    return (
        <main className="container mx-auto px-2 sm:px-4 flex flex-col">
            {/* Display header */}
            <HomePageHeader
                title='Mes formulaires'
                description='Retrouvez tous vos formulaires enregistrés et modifiez-les facilement.'
            />

            <hr className="mb-6 border-t border-muted" />

            {/* Display loading animation while fetching data */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Chargement ...</span>
                </div>
            ) : error ? (
                <div className="text-red-500 py-4 bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="font-semibold text-red-700 mb-2">Erreur de chargement</h3>
                    <p>{error}</p>
                </div>
            ) : (
                // Show appropriate view based on whether user has published forms
                hasPublishedForms ? <FormsListView /> : <EmptyFormsView text="Vous n'avez encore aucun formulaire" />
            )}
        </main>
    );
}