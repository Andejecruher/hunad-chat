import { ThemeToggle } from '@/components/welcome/theme-toggle';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function Header() {
    const { auth } = usePage<SharedData>().props;

    const handleSmoothScroll = (
        e: React.MouseEvent<HTMLAnchorElement>,
        targetId: string,
    ) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container m-auto flex h-16 items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <img
                            src="/logos/logo-hunad-chat.png"
                            alt="Omnichannel AI Hub"
                            width={40}
                            height={40}
                            className="h-8 w-8"
                        />
                        <span className="text-xl font-bold">
                            {import.meta.env.VITE_APP_NAME}
                        </span>
                    </Link>
                </div>

                <nav className="hidden items-center space-x-6 md:flex">
                    <a
                        href="#features"
                        onClick={(e) => handleSmoothScroll(e, 'features')}
                        className="cursor-pointer text-sm font-medium transition-colors hover:text-primary"
                    >
                        Characteristics
                    </a>
                    <a
                        href="#integrations"
                        onClick={(e) => handleSmoothScroll(e, 'integrations')}
                        className="cursor-pointer text-sm font-medium transition-colors hover:text-primary"
                    >
                        Integrations
                    </a>
                    <a
                        href="#pricing"
                        onClick={(e) => handleSmoothScroll(e, 'pricing')}
                        className="cursor-pointer text-sm font-medium transition-colors hover:text-primary"
                    >
                        Prices
                    </a>
                    <a
                        href="#support"
                        onClick={(e) => handleSmoothScroll(e, 'support')}
                        className="cursor-pointer text-sm font-medium transition-colors hover:text-primary"
                    >
                        Supports
                    </a>
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
                                Log In
                            </Link>
                            <Link
                                href={register()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
