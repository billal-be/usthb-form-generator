"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Edit, Mail, Crown, User as UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast, Toaster } from 'sonner';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
};

function UserCard({
  user,
  onDelete,
  onUpdate
}: {
  user: User,
  onDelete: (userId: number) => void,
  onUpdate: (updatedUser: User) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user.username,
    email: user.email,
    role: user.role
  });

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`https://projuniv-backend.onrender.com/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onDelete(user.id);
      setIsDeleteDialogOpen(false);
      toast.success("Utilisateur supprimé avec succès");

    } catch (error: any) {
      //console.error("Error deleting user:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`https://projuniv-backend.onrender.com/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: editForm.username,
          email: editForm.email,
          role: editForm.role
        })
      });

      if (!response.ok) {
        throw new Error("Un utilisateur avec cette adresse email existe déjà");
      }

      const updatedUser = {
        ...user,
        username: editForm.username,
        email: editForm.email,
        role: editForm.role
      };

      onUpdate(updatedUser);
      setIsEditDialogOpen(false);
      toast.success("Utilisateur mis à jour avec succès");

    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleIcon = (role: string) => {
    return role.toLowerCase() === 'admin' ? <Crown className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />;
  };

  const getRoleColor = (role: string) => {
    return role.toLowerCase() === 'admin'
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <Card className="p-6 relative flex flex-col hover:shadow-md transition-shadow">
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
              disabled={isDeleting || isUpdating}
              title="Modifier l'utilisateur"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'utilisateur "{user.username}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Nom d'utilisateur"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">Utilisateur</SelectItem>
                    <SelectItem value="Admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating || !editForm.username || !editForm.email}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                {isUpdating ? "Mise à jour..." : "Sauvegarder"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              disabled={isDeleting || isUpdating}
              title="Supprimer l'utilisateur"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer l'utilisateur</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer l'utilisateur "{user.username}" ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <CardContent className="px-0 pr-16 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{user.username}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getRoleColor(user.role)}`}>
            {getRoleIcon(user.role)}
            {user.role}
          </span>
        </div>
      </CardContent>

      <CardFooter className="px-0 mt-auto pt-4">
        <div className="text-xs text-gray-500">
          ID: {user.id}
        </div>
      </CardFooter>
    </Card>
  );
}

interface UsersListViewProps {
  users: User[];
  onUserDelete: (userId: number) => void;
  onUserUpdate: (updatedUser: User) => void;
}

export default function AdminUsersListView({ users, onUserDelete, onUserUpdate }: UsersListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(user => user.role.toLowerCase() === 'admin').length;
  const userCount = users.filter(user => user.role.toLowerCase() === 'user').length;

  return (
    <div>
      <div className="py-4">
        <div className="flex flex-col justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Utilisateurs ({users.length})
            </h2>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Crown className="h-4 w-4" />
                {adminCount} Admin{adminCount !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                {userCount} Utilisateur{userCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="user">Utilisateurs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter !== "all"
                ? "Essayez de modifier vos critères de recherche."
                : "Il n'y a pas encore d'utilisateurs."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onDelete={onUserDelete}
                onUpdate={onUserUpdate}
              />
            ))}
          </div>
        )}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}