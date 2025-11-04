import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { PaginationLink } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    links: PaginationLink[];
    onChange: (url: string | undefined) => void;
    showInfo?: boolean;
    position?: 'left' | 'center' | 'right';
    total?: number;
    to?: number;
    from?: number;
}

export function Pagination({
    links,
    onChange,
    showInfo = false,
    position = 'left',
    total = 0,
    to = 0,
    from = 0,
}: PaginationProps) {
    const justifyClass =
        position === 'center'
            ? 'justify-center'
            : position === 'right'
              ? 'justify-end'
              : 'justify-start';

    return (
        <TooltipProvider>
            <div
                className={`flex items-center ${justifyClass} w-full space-x-2`}
            >
                {showInfo && (
                    <span
                        className="mr-2 text-sm text-muted-foreground"
                        aria-live="polite"
                    >
                        Mostrando {from} - {to} de {total}
                    </span>
                )}
                <div className="flex items-center space-x-1">
                    {links.map((link, index) => {
                        if (
                            link.label === '&laquo; Anterior' ||
                            link.label === '&laquo; Previous'
                        ) {
                            return (
                                <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onChange(link.url)}
                                            disabled={!link.url}
                                            aria-label="Página anterior"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Página anterior</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }
                        if (
                            link.label === 'Siguiente &raquo;' ||
                            link.label === 'Next &raquo;'
                        ) {
                            return (
                                <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => onChange(link.url)}
                                            disabled={!link.url}
                                            aria-label="Página siguiente"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Página siguiente</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }
                        return (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onChange(link.url)}
                                disabled={!link.url}
                                className="h-8 w-8 p-0"
                                aria-label={`Página ${link.label}`}
                            >
                                {link.label}
                            </Button>
                        );
                    })}
                </div>
            </div>
        </TooltipProvider>
    );
}
