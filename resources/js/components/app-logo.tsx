export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-transparent text-sidebar-primary-foreground">
                <img
                    src="/logos/logo-hunad-chat.png"
                    alt="HunadChat"
                    className="h-auto w-auto"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold">
                    {import.meta.env.VITE_APP_NAME}
                </span>
            </div>
        </>
    );
}
