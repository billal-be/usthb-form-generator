"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import CreateFormPage from "./CreateFormPage";
import FormsPage from "./FormsPage";
import UsersPage from "./UsersPage";
import CreateUserPage from "./CreateUserPage";
import { ChevronRight, FilePlus, File, Users, UserPlus } from "lucide-react";
import Logo from "@/components/Logo";

const menuItems = [
  {
    id: "forms",
    label: "Tous les formulaires",
    content: "Tous les formulaires et reponses",
    icon: File
  },
  {
    id: "create",
    label: "Créer un formulaire",
    content: "Page de création de formulaire",
    icon: FilePlus
  },
  {
    id: "users",
    label: "Tous les utilisateurs",
    content: "Gestion des utilisateurs",
    icon: Users
  },
  {
    id: "create-user",
    label: "Créer un utilisateur",
    content: "Page de création d'utilisateur",
    icon: UserPlus
  },
];

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionFromUrl = searchParams.get("section");
  const active = sectionFromUrl ?? "forms";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth < 768;
      if (smallScreen !== isSmallScreen) {
        setIsCollapsed(smallScreen);
      }
      setIsSmallScreen(smallScreen);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSmallScreen]);

  return (
    <div className="flex min-h-screen relative">
      <aside
        className={cn(
          "bg-white border-r flex flex-col fixed h-full transition-all duration-300 ease-in-out z-20",
          isCollapsed ? "w-14" : "w-64"
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute top-4 -right-3 bg-white rounded-full p-1 border shadow-sm z-30 transition-transform duration-150",
            isCollapsed ? "rotate-0" : "rotate-180"
          )}
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>

        <div className="my-8 flex justify-center">
          <div
            className={cn(
              "text-3xl mr-1",
              isCollapsed ? "opacity-0 absolute" : "opacity-100 transition-opacity duration-300"
            )}
          >
            USTHB
          </div>
          <Logo className="w-9 h-9 text-blue-600" />
          <div
            className={cn(
              "text-3xl font-extrabold -ml-1 text-blue-600",
              isCollapsed ? "opacity-0 absolute" : "opacity-100 transition-opacity duration-300"
            )}
          >
            ORMS
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => router.push(`/admin?section=${item.id}`)}
                className={cn(
                  "relative text-left py-2 rounded-md transition-colors duration-150 flex items-center overflow-hidden",
                  active === item.id
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "hover:bg-gray-100 text-gray-700",
                  isCollapsed ? "justify-center px-2" : "px-4"
                )}
                title={isCollapsed ? item.label : ""}
              >
                {active === item.id && (
                  <span className="absolute right-0 h-full w-1 bg-blue-600"></span>
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-150",
                    isCollapsed ? "transform scale-110" : ""
                  )}
                />
                <span
                  className={cn(
                    "ml-3 whitespace-nowrap transition-all duration-150",
                    isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main
        className={cn(
          "flex-1 p-4 sm:p-6 pt-6 min-h-screen overflow-x-hidden transition-all duration-150",
          isCollapsed ? "ml-14" : "ml-0 md:ml-64"
        )}
      >
        {active === "forms" ? (
          <FormsPage />
        ) : active === "create" ? (
          <CreateFormPage />
        ) : active === "users" ? (
          <UsersPage />
        ) : active === "create-user" ? (
          <CreateUserPage />
        ) : (
          <>
            <h1 className="text-xl font-semibold">
              {menuItems.find((item) => item.id === active)?.label}
            </h1>
            <p className="text-gray-600">
              {menuItems.find((item) => item.id === active)?.content}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
