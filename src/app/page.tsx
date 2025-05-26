'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center bg-white h-screen">
      <div className="flex flex-col items-center justify-center p-10 text-center h-full max-w-[1000px]">
        <div className="mb-12">
          <Logo className="h-[110px] w-auto text-blue-600" />
        </div>

        <p className="text-center my-10">
          Ce logiciel est conçu pour aider l'administration de l'USTHR à générer des formulaires officiels.
          Simplifiez votre flux de travail, assurez la précision et créez des documents professionnels en quelques
          clics. Commencez dès maintenant !
        </p>

        <Button onClick={() => {
          router.push('/login');
        }} className="bg-blue-600 hover:bg-blue-700">
          Commencer
        </Button>
      </div>
    </div>
  );
}