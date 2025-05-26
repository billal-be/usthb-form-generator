import { LogOut } from "lucide-react";

type PageHeaderProps = {
    title: string;
    description: string;
};

export default function HomePageHeader({ title, description }: PageHeaderProps) {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="mb-6 flex justify-between items-center gap-4">
            <div className="space-y-0.5 flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold truncate">{title}</h1>
                <p className="text-sm text-muted-foreground truncate">{description}</p>
            </div>
            <button
                onClick={handleLogout}
                className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2 flex-shrink-0"
                title="Déconnecté"
            >
                <LogOut size={16} />
                <span className="hidden sm:inline">Déconnecté</span>
            </button>
        </div>
    );
}