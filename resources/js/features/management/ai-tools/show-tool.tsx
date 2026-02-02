import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import aiToolsRoutes from '@/routes/ai-tools';
import { ExecutionStats, ExternalConfigComplete, InternalConfigComplete, type SchemaFieldComplete, type Tool } from '@/types';
import { router } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    CheckCircle2,
    Code2,
    Edit,
    Globe,
    Layers,
    Settings2,
    TrendingUp,
    User,
    XCircle
} from "lucide-react";

import { TestToolSection } from './test-tool-section';

interface ShowToolProps {
    tool: Tool;
    executionStats: ExecutionStats;
}

/**
 * ShowTool - Componente principal de visualización de herramientas IA
 * 
 * Este componente ha sido refactorizado para integrar la funcionalidad de prueba
 * directamente en la vista principal, eliminando el modal y usando TestToolSection
 * como componente inline. Utiliza Wayfinder para el manejo consistente de rutas.
 */
export function ShowTool({ tool, executionStats }: ShowToolProps) {

    const handleEdit = () => {
        router.visit(aiToolsRoutes.edit({ ai_tool: tool.id }).url);
    };

    const handleToggleStatus = () => {
        router.patch(aiToolsRoutes.toggleStatus({ tool: tool.id }).url, {}, {
            preserveState: true,
            onSuccess: () => {
                // El estado se actualizará automáticamente
            }
        });
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Nunca';
        return new Date(dateString).toLocaleString('es-ES');
    };

    const parseSchema = (schema: string | { inputs: SchemaFieldComplete[]; outputs: SchemaFieldComplete[]; }) => {
        try {
            return typeof schema === 'string' ? JSON.parse(schema) : schema;
        } catch {
            return { inputs: [], outputs: [] };
        }
    };

    const parseConfig = (configString: string | InternalConfigComplete | ExternalConfigComplete) => {
        try {
            return typeof configString === 'string' ? JSON.parse(configString) : configString;
        } catch {
            return {};
        }
    };

    const schema = parseSchema(tool.schema);
    const config = parseConfig(tool.config);

    const getStatusColor = () => {
        return tool.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const getTypeIcon = () => {
        return tool.type === 'internal' ? <Layers className="h-4 w-4" /> : <Globe className="h-4 w-4" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="font-heading text-3xl font-bold text-foreground">{tool.name}</h1>
                        <Badge className={getStatusColor()}>
                            {tool.enabled ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>
                    {tool.description && (
                        <p className="text-muted-foreground max-w-2xl">
                            {tool.description}
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleEdit}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleToggleStatus}
                    >
                        <Settings2 className="mr-2 h-4 w-4" />
                        {tool.enabled ? 'Deshabilitar' : 'Habilitar'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ejecuciones</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{executionStats.total_executions}</div>
                        <p className="text-xs text-muted-foreground">
                            Últimos 30 días
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de éxito</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{executionStats.success_rate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {executionStats.successful_executions} exitosas, {executionStats.failed_executions} fallidas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tiempo promedio</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {executionStats.avg_execution_time
                                ? `${Math.round(executionStats.avg_execution_time)}ms`
                                : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Por ejecución
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Última ejecución</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">
                            {formatDate(executionStats.last_execution)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Tool Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings2 className="h-5 w-5" />
                            Información de la herramienta
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Tipo:</span>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    {getTypeIcon()}
                                    {tool.type === 'internal' ? 'Interna' : 'Externa'}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Categoría:</span>
                                <Badge variant="outline">{tool.category}</Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Slug:</span>
                                <code className="text-xs bg-muted px-2 py-1 rounded">{tool.slug}</code>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Estado:</span>
                                <div className="flex items-center gap-1">
                                    {tool.enabled ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm">{tool.enabled ? 'Habilitado' : 'Deshabilitado'}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Creado por:</span>
                                <div className="flex items-center gap-1 text-sm">
                                    <User className="h-3 w-3" />
                                    Usuario #{tool.created_by}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Creado:</span>
                                <span className="text-sm">{formatDate(tool.created_at)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Actualizado:</span>
                                <span className="text-sm">{formatDate(tool.updated_at)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code2 className="h-5 w-5" />
                            Configuración
                        </CardTitle>
                        <CardDescription>
                            Configuración {tool.type === 'internal' ? 'interna' : 'externa'} de la herramienta
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                            <code>{JSON.stringify(config, null, 2)}</code>
                        </pre>
                    </CardContent>
                </Card>
            </div>

            {/* Schema */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Schema de datos
                    </CardTitle>
                    <CardDescription>
                        Estructura de entrada y salida de la herramienta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Inputs */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Entradas ({schema.inputs?.length || 0})</h4>
                            {schema.inputs?.length > 0 ? (
                                <div className="space-y-2">
                                    {schema.inputs.map((input: SchemaFieldComplete, index: number) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-3 space-y-2 text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{input.name}</span>
                                                <div className="flex gap-1">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {input.type}
                                                    </Badge>
                                                    {input.required && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            requerido
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {input.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {input.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay campos de entrada definidos</p>
                            )}
                        </div>

                        {/* Outputs */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Salidas ({schema.outputs?.length || 0})</h4>
                            {schema.outputs?.length > 0 ? (
                                <div className="space-y-2">
                                    {schema.outputs.map((output: SchemaFieldComplete, index: number) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-3 space-y-2 text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{output.name}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {output.type}
                                                </Badge>
                                            </div>
                                            {output.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {output.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay campos de salida definidos</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Tool Section */}
            <TestToolSection
                toolId={tool.id}
                toolName={tool.name}
                inputs={schema.inputs || []}
                outputs={schema.outputs || []}
                enabled={tool.enabled}
            />
        </div>
    );
}