export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

export type ToolType = "internal" | "external"
export type InternalAction = "create_ticket" | "transfer_department" | "send_message"
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
export type FieldType = "string" | "number" | "boolean" | "object" | "array"

// Base Tool interface para datos del backend
export interface Tool {
    id: number;
    name: string;
    slug: string;
    category: string;
    type: ToolType;
    description?: string;
    schema: {
        inputs: SchemaFieldComplete[];
        outputs: SchemaFieldComplete[];
    };
    config: InternalConfigComplete | ExternalConfigComplete;
    enabled: boolean;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    updated_by?: number;
    company_id: number;
    executions?: ToolExecution[];
}

export interface ToolExecution {
    id: number;
    status: 'accepted' | 'success' | 'failed';
    payload: Record<string, unknown>;
    result?: Record<string, unknown>;
    error?: Record<string, unknown>;
    created_at: string;
    updated_at?: string;
}

// Tipos para el Schema Builder
export interface SchemaFieldComplete {
    name: string
    type: FieldType
    required: boolean
    description: string
}

export interface SchemaBuilderStateComplete {
    inputs: SchemaFieldComplete[]
    outputs: SchemaFieldComplete[]
}

// Tipos para el Config Builder (Internal Tools)
export interface InternalConfigComplete {
    action: InternalAction
    department?: string
    priority?: "low" | "medium" | "high"
    tags?: string[]
}

// Tipos para el Config Builder (External Tools)
export interface HttpHeaderComplete {
    key: string
    value: string
}

export interface ExternalConfigComplete {
    method: HttpMethod
    url: string
    timeout?: number
    retries?: number
    headers?: HttpHeaderComplete[]
    body?: Record<string, unknown>
    queryParams?: Record<string, unknown>
}

export type ConfigBuilderStateComplete = InternalConfigComplete | ExternalConfigComplete

// Entidad principal Tool
export interface ToolComplete {
    id: string
    company_id?: string
    name: string
    slug: string
    type: ToolType
    description?: string
    schema: SchemaBuilderStateComplete
    config: ConfigBuilderStateComplete
    enabled: boolean
    created_at: string
    updated_at: string
}

// Formulario de Tool
export interface ToolFormComplete {
    name: string
    type: ToolType
    description: string
    enabled: boolean
    schema: SchemaBuilderStateComplete
    config: ConfigBuilderStateComplete
}

export interface ExecutionStats {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    avg_execution_time: number | null;
    last_execution: string | null;
    success_rate: number;
}

// Mock data
export const mockTools: ToolComplete[] = [
    {
        id: "1",
        company_id: "company-1",
        name: "Create Support Ticket",
        slug: "create-support-ticket",
        type: "internal",
        description: "Crea un ticket de soporte automáticamente",
        schema: {
            inputs: [
                { name: "title", type: "string", required: true, description: "Título del ticket" },
                { name: "description", type: "string", required: true, description: "Descripción del problema" },
                { name: "priority", type: "string", required: false, description: "Prioridad del ticket" },
            ],
            outputs: [
                { name: "ticket_id", type: "string", required: true, description: "ID del ticket creado" },
                { name: "status", type: "string", required: true, description: "Estado del ticket" },
            ],
        },
        config: {
            action: "create_ticket",
            department: "soporte",
            priority: "medium",
            tags: ["automated", "ai-generated"],
        },
        enabled: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
    },
    {
        id: "2",
        company_id: "company-1",
        name: "Knowledge Base Search",
        slug: "knowledge-base-search",
        type: "external",
        description: "Busca información en la base de conocimientos externa",
        schema: {
            inputs: [
                { name: "query", type: "string", required: true, description: "Consulta de búsqueda" },
                { name: "limit", type: "number", required: false, description: "Número máximo de resultados" },
            ],
            outputs: [
                { name: "results", type: "array", required: true, description: "Resultados de la búsqueda" },
                { name: "count", type: "number", required: true, description: "Número de resultados" },
            ],
        },
        config: {
            method: "POST",
            url: "https://api.company.com/kb/search",
            timeout: 5000,
            retries: 3,
            headers: [
                { key: "Authorization", value: "Bearer {{secret.api_key}}" },
                { key: "Content-Type", value: "application/json" },
            ],
            body: {},
        },
        enabled: true,
        created_at: "2024-01-10T14:30:00Z",
        updated_at: "2024-01-20T09:15:00Z",
    },
]
