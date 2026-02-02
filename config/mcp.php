<?php

return [
    /*
    |--------------------------------------------------------------------------
    | MCP Server Configuration
    |--------------------------------------------------------------------------
    |
    | `protocol` and `version` control the manifest values emitted by the
    | MCP endpoint. These can be overridden via environment variables.
    |
    */
    'protocol' => env('MCP_PROTOCOL', 'mcp'),
    'version' => env('MCP_VERSION', '1.0.0'),
];
