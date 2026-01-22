import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFlashMessages } from '@/hooks/useFlashMessages'
import channelsRouter from '@/routes/channels'
import { type Channel, Filters, FlashPayload, PaginatedData } from '@/types'
import { router, usePage } from "@inertiajs/react"
import { useEffect, useState } from "react"
import { ChannelAdd } from "./channel-add"
import { ChannelFilter } from "./channel-filter"
import { ChannelTable } from "./channel-table"

export function Channels({ channelsData, filters }: {
    channelsData: PaginatedData<Channel[]>;
    filters: Filters;
}) {
    const { props } = usePage();
    const [searchQuery, setSearchQuery] = useState(filters.search || "")
    const [statusFilter, setStatusFilter] = useState(filters.status || "all")
    const [typeFilter, setTypeFilter] = useState(filters.type || "all")
    const [limitFilter, setLimitFilter] = useState(filters.limit || "10")
    const [isLoading, setIsLoading] = useState(false)

    useFlashMessages(props.flash as FlashPayload['flash']);

    const handleDetailsClick = (channel: Channel) => {
        const url = channelsRouter.show.url({ channel: channel.id })
        router.visit(url)
    }

    const handleEditChannel = (channel: Channel) => {
        const url = channelsRouter.edit.url({ channel: channel.id })
        router.visit(url)
    }

    const handleChangeStatus = async (id: number, status: 'active' | 'inactive') => {
        const url = channelsRouter.update.url({ channel: id })
        router.patch(url, { status: status }, {
            preserveState: true,
            preserveScroll: true,
            only: ['channels', 'flash'],
        })
    }

    const handleDeleteChannel = async (id: number) => {
        const url = channelsRouter.destroy.url({ channel: id })
        router.delete(url, {
            preserveState: true,
            preserveScroll: true,
            only: ['channels', 'flash'],
        })
    }

    useEffect(() => {
        const initial = {
            search: filters.search ?? '',
            limit: filters.limit ?? '10',
            status: filters.status ?? 'all',
            type: filters.type ?? 'all',
        };

        if (
            searchQuery === initial.search &&
            limitFilter === initial.limit &&
            statusFilter === initial.status &&
            typeFilter === initial.type
        ) {
            return;
        }

        // Debounce para búsqueda
        const handler = setTimeout(() => {
            const params = {
                search: searchQuery,
                status: statusFilter,
                type: typeFilter,
                limit: limitFilter,
            };
            const url = channelsRouter.index.url({ query: params });
            router.get(
                url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['channels', 'flash'],
                    onStart: () => setIsLoading(true),
                    onFinish: () => setIsLoading(false),
                },
            );
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, statusFilter, typeFilter, limitFilter, filters]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">Canales de Comunicación</h1>
                    <p className="text-muted-foreground">Gestiona tus integraciones con plataformas de mensajería</p>
                </div>
                {/* Botón para agregar nuevo canal */}
                <ChannelAdd />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Buscar Canales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Filtro de Canales */}
                    <ChannelFilter
                        limitValue={limitFilter}
                        searchValue={searchQuery}
                        statusValue={statusFilter}
                        platformValue={typeFilter}
                        onLimitChange={setLimitFilter}
                        onSearchChange={setSearchQuery}
                        onStatusChange={setStatusFilter}
                        onPlatformChange={setTypeFilter}
                    />

                    {/* Tabla de Canales */}
                    {channelsData.data && channelsData.data.length > 0 && (
                        <ChannelTable
                            channels={channelsData.data}
                            onEditChannel={handleEditChannel}
                            onDetailsClick={handleDetailsClick}
                            onDeleteChannel={handleDeleteChannel}
                            onChangeStatus={handleChangeStatus}
                        />
                    )}

                    {channelsData.data.length === 0 && !isLoading && (
                        <p className="text-center text-muted-foreground">No se encontraron canales.</p>
                    )}

                    {isLoading && <p className="text-center text-muted-foreground">Cargando canales...</p>}
                </CardContent>
            </Card>
        </div>
    )
}
