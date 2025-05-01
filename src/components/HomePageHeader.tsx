type PageHeaderProps = {
    title: string;
    description: string;
};

export default function HomePageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="space-y-0.5">
                <h1 className="text-xl sm:text-2xl font-extrabold">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}