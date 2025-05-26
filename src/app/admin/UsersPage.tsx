"use client";

import React from 'react';
import HomePageHeader from "@/components/HomePageHeader";
import { useState, useEffect } from "react";
import AdminEmptyUsersView from "./AdminEmptyUsersView";
import AdminUsersListView from "./AdminUsersListView";

type User = {
    id: number;
    username: string;
    email: string;
    role: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
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

                const response = await fetch('https://projuniv-backend.onrender.com/users', {
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

                // Set the users data
                setUsers(Array.isArray(data) ? data : []);

            } catch (error: any) {
                //console.error("Error fetching users:", error);
                setError(error.message || "Failed to load users");
                setUsers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Handler to remove a user from the list after successful deletion
    const handleUserDelete = (deletedUserId: number) => {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== deletedUserId));
    };

    // Handler to update a user in the list after successful update
    const handleUserUpdate = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(user => 
            user.id === updatedUser.id ? updatedUser : user
        ));
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Chargement ...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-red-500 py-4 bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="font-semibold text-red-700 mb-2">Erreur de chargement</h3>
                    <p>{error}</p>
                </div>
            );
        }

        if (users.length === 0) {
            return <AdminEmptyUsersView />;
        }

        return (
            <AdminUsersListView
                users={users}
                onUserDelete={handleUserDelete}
                onUserUpdate={handleUserUpdate}
            />
        );
    };

    return (
        <main className="container mx-auto px-2 sm:px-4 flex flex-col">
            <HomePageHeader
                title='Gestion des Utilisateurs'
                description='Gérer tous les utilisateurs de la plateforme'
            />

            <hr className="mb-6 border-t border-muted" />

            {renderContent()}
        </main>
    );
}