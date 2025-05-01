'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const goToLogin = ()=>{
    router.push('/login');
  }

  return (

    <div className="flex items-center justify-center bg-white h-screen">
      <div className="flex flex-col items-center justify-center p-10 text-center h-full max-w-[1000px]">
        <div className="mb-12">
          <Image
            src="/images/usthb-form-generator-logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="h-[110px] w-auto"
          />
        </div>

        <p className="text-center my-10">
          Ce logiciel est conçu pour aider l'administration de l'USTHR à générer des formulaires officiels.
          Simplifiez votre flux de travail, assurez la précision et créez des documents professionnels en quelques
          clics. Commencez dès maintenant !
        </p>

        <Button onClick={goToLogin} className="bg-blue-600 hover:bg-blue-700">
          Commencer
        </Button>
      </div>
    </div>
  );
}
