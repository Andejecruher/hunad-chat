import { ThemeToggle } from "@/components/welcome/theme-toggle"
import {Link, usePage} from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type {SharedData} from "@/types";
export function Header() {
    const { auth } = usePage<SharedData>().props;
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between m-auto">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <img src="/logos/logo-hunad-chat.png" alt="Omnichannel AI Hub" width={40} height={40} className="h-8 w-8" />
                        <span className="font-bold text-xl">
                            {import.meta.env.VITE_APP_NAME}
                        </span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center space-x-6">
                    <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                        Características
                    </Link>
                    <Link href="#integrations" className="text-sm font-medium hover:text-primary transition-colors">
                        Integraciones
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                        Precios
                    </Link>
                    <Link href="#support" className="text-sm font-medium hover:text-primary transition-colors">
                        Soporte
                    </Link>
                </nav>

                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    {auth.user ? (
                        <Link
                            href={dashboard()}
                            className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                            >
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Register
                            </Link>
                        </>
                    )}

                </div>
            </div>
        </header>
    )
}

