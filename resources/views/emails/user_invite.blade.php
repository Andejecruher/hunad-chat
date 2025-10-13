<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación a {{ config('app.name') }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            font-size: 20px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .credentials {
            background-color: #f3f4f6;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .credential-item {
            margin: 8px 0;
        }
        .credential-label {
            font-weight: 600;
            color: #374151;
        }
        .credential-value {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background-color: #e5e7eb;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-left: 10px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .instructions {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ config('app.name') }}</div>
            <h1 class="title">¡Has sido invitado a unirte a nuestro equipo!</h1>
        </div>

        <p>Hola <strong>{{ $name ?? 'Usuario' }}</strong>,</p>

        <p>Has sido invitado a formar parte de <strong>{{ config('app.name') }}</strong> como <strong>{{ ucfirst($role) }}</strong>.
        Estamos emocionados de tenerte en nuestro equipo.</p>

        <div class="credentials">
            <h3 style="margin-top: 0; color: #374151;">Credenciales de acceso:</h3>
            <div class="credential-item">
                <span class="credential-label">Email:</span>
                <span class="credential-value">{{ $email }}</span>
            </div>
            <div class="credential-item">
                <span class="credential-label">Contraseña temporal:</span>
                <span class="credential-value">{{ $password }}</span>
            </div>
        </div>

        <p style="text-align: center;">
            <a href="{{ $verificationUrl }}" class="button">Activar mi cuenta</a>
        </p>

        <div class="instructions">
            <h4 style="margin-top: 0; color: #92400e;">Instrucciones importantes:</h4>
            <ol style="margin: 0; color: #92400e;">
                <li>Haz clic en el botón "Activar mi cuenta" para verificar tu email</li>
                <li>Inicia sesión con las credenciales proporcionadas</li>
                <li><strong>Cambia tu contraseña inmediatamente</strong> después del primer acceso</li>
                <li>Completa tu perfil con tu información personal</li>
            </ol>
        </div>

        <p><strong>Nota de seguridad:</strong> Este enlace de activación expirará en 60 minutos por razones de seguridad.
        Si no puedes activar tu cuenta a tiempo, contacta con el administrador.</p>

        <div class="footer">
            <p>Si no esperabas este email, puedes ignorarlo de forma segura.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
