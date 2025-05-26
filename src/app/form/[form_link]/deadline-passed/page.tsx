import { AlertCircle } from "lucide-react"

export default function DeadlinePassedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[#e6f0ff] px-4">
      <div className="backdrop-blur-lg bg-white/70 border border-red-400/30 rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center space-y-6">
        
        <div className="flex items-center justify-center">
          <div className="bg-red-500 p-4 rounded-full shadow-lg">
            <AlertCircle className="text-white w-12 h-12" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-red-600">
          Date limite dépassée
        </h2>

        <p className="text-gray-700 text-lg leading-relaxed">
          Vous ne pouvez plus remplir ce formulaire. La période de soumission est terminée.
        </p>
      </div>
    </div>
  )
}