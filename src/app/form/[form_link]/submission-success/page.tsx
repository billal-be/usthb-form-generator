import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-[#F0F6FF] border border-[#1D74F5]/30 rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
        
        <div className="flex items-center justify-center">
          <div className="bg-[#1D74F5] p-4 rounded-full shadow-md">
            <CheckCircle className="text-white w-10 h-10" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#1D74F5]">
          Votre soumission a été enregistrée avec succès
        </h2>

        <p className="text-gray-700">
          Merci d’avoir rempli le formulaire.
        </p>
      </div>
    </div>
  )
}