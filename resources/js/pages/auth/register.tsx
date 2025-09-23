import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { ValidationErrors } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Building2,
    Eye,
    EyeOff,
    LoaderCircle,
    Monitor,
    Palette,
    Upload,
    User,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
interface BrandingTheme {
    light: {
        colors: {
            primary: string;
            secondary: string;
        };
    };
    dark: {
        colors: {
            primary: string;
            secondary: string;
        };
    };
}

interface CompanyData {
    name: string;
    slug: string;
    subscription: string;
}

interface UserData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface BrandingData {
    theme: BrandingTheme;
    logoUrl: string;
    defaultTheme: 'light' | 'dark';
}
export default function Register() {
    const [companyData, setCompanyData] = useState<CompanyData>({
        name: '',
        slug: '',
        subscription: 'Free',
    });

    const [userData, setUserData] = useState<UserData>({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [brandingData, setBrandingData] = useState<BrandingData>({
        theme: {
            light: {
                colors: {
                    primary: '#000000',
                    secondary: '#052d67',
                },
            },
            dark: {
                colors: {
                    primary: '#000000',
                    secondary: '#052d67',
                },
            },
        },
        logoUrl: '',
        defaultTheme: 'light',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Generate slug from company name
    const generateSlug = useCallback((name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }, []);

    const handleCompanyNameChange = (name: string) => {
        setCompanyData((prev) => ({
            ...prev,
            name,
            slug: generateSlug(name),
        }));
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setLogoFile(file);
                const url = URL.createObjectURL(file);
                setBrandingData((prev) => ({ ...prev, logoUrl: url }));
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const url = URL.createObjectURL(file);
            setBrandingData((prev) => ({ ...prev, logoUrl: url }));
        }
    };

    const updateThemeColor = (
        theme: 'light' | 'dark',
        colorType: 'primary' | 'secondary',
        color: string,
    ) => {
        setBrandingData((prev) => ({
            ...prev,
            theme: {
                ...prev.theme,
                [theme]: {
                    ...prev.theme[theme],
                    colors: {
                        ...prev.theme[theme].colors,
                        [colorType]: color,
                    },
                },
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!companyData.name || !companyData.slug) {
            toast.error('Por favor completa los datos de la empresa');
            return;
        }

        if (!userData.fullName || !userData.email || !userData.password) {
            toast.error('Por favor completa todos los datos del usuario');
            return;
        }

        if (userData.password !== userData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (userData.password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setIsSubmitting(true);

        try {
            // Preparar datos para envío
            const formData = new FormData();

            // Datos de la empresa
            formData.append('company_name', companyData.name);
            formData.append('company_slug', companyData.slug);
            formData.append(
                'subscription_type',
                companyData.subscription.toLowerCase(),
            );

            // Datos del usuario
            formData.append('user_name', userData.fullName);
            formData.append('user_email', userData.email);
            formData.append('user_password', userData.password);
            formData.append(
                'user_password_confirmation',
                userData.confirmPassword,
            );

            // Datos de branding
            formData.append(
                'branding_theme',
                JSON.stringify(brandingData.theme),
            );
            formData.append(
                'branding_default_theme',
                brandingData.defaultTheme,
            );

            // Logo si existe
            if (logoFile) {
                formData.append('branding_logo', logoFile);
            }

            // Enviar usando Inertia
            router.post('/register', formData, {
                forceFormData: true,
                onSuccess: () => {
                    // El controlador redirige automáticamente al dashboard
                },
                onError: (errors) => {
                    setErrors(errors);
                    if (errors.error) {
                        toast.error(errors.error);
                    } else {
                        toast.error(
                            'Error en el registro. Por favor verifica los datos e intenta nuevamente.',
                        );
                    }
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            toast.error(`Error inesperado durante el registro : ${error}`);
            setIsSubmitting(false);
        }
    };

    const currentTheme = brandingData.defaultTheme;
    const currentColors = brandingData.theme[currentTheme].colors;
    return (
        <AuthLayout
            title="Create an account"
            description="Configura tu empresa y personaliza tu plataforma de atención omnicanal"
            maxWidthClass="max-w-auto"
        >
            <Head title="Register" />
            <main className="container mx-auto max-w-6xl px-4 py-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Left Column - Company and User Data */}
                        <div className="space-y-8">
                            {/* Company Data Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Datos de la Empresa
                                    </CardTitle>
                                    <CardDescription>
                                        Información básica de tu empresa
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">
                                            Nombre de la empresa *
                                        </Label>
                                        <Input
                                            id="companyName"
                                            value={companyData.name}
                                            onChange={(e) =>
                                                handleCompanyNameChange(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Mi Empresa S.A."
                                            name="companyName"
                                            required
                                        />
                                        <InputError
                                            message={errors.company_name}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="companySlug">
                                            Slug de la empresa *
                                        </Label>
                                        <Input
                                            name="companySlug"
                                            id="companySlug"
                                            value={companyData.slug}
                                            onChange={(e) =>
                                                setCompanyData((prev) => ({
                                                    ...prev,
                                                    slug: e.target.value,
                                                }))
                                            }
                                            placeholder="mi-empresa"
                                            required
                                        />
                                        <InputError
                                            message={errors.company_slug}
                                            className="mt-2"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            URL: {import.meta.env.VITE_APP_URL}/
                                            {companyData.slug}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Data Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Usuario Administrador
                                    </CardTitle>
                                    <CardDescription>
                                        Datos del usuario administrador
                                        principal
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">
                                            Nombre completo *
                                        </Label>
                                        <Input
                                            name="name"
                                            id="fullName"
                                            value={userData.fullName}
                                            onChange={(e) =>
                                                setUserData((prev) => ({
                                                    ...prev,
                                                    fullName: e.target.value,
                                                }))
                                            }
                                            placeholder="Juan Pérez"
                                            required
                                        />
                                        <InputError
                                            message={errors.user_name}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={userData.email}
                                            onChange={(e) =>
                                                setUserData((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            placeholder="juan@miempresa.com"
                                            required
                                        />
                                        <InputError
                                            message={errors.user_email}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Contraseña *
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                name="password"
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={userData.password}
                                                onChange={(e) =>
                                                    setUserData((prev) => ({
                                                        ...prev,
                                                        password:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="Mínimo 8 caracteres"
                                                required
                                                minLength={8}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <InputError
                                                message={errors.user_password}
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">
                                            Confirmar contraseña *
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                name="password_confirmation"
                                                id="confirmPassword"
                                                type={
                                                    showConfirmPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={userData.confirmPassword}
                                                onChange={(e) =>
                                                    setUserData((prev) => ({
                                                        ...prev,
                                                        confirmPassword:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="Repite la contraseña"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword,
                                                    )
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <InputError
                                                message={errors.user_password}
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Branding and Preview */}
                        <div className="space-y-8">
                            {/* Branding Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Palette className="h-5 w-5" />
                                        Branding y Personalización
                                    </CardTitle>
                                    <CardDescription>
                                        Personaliza la apariencia de tu
                                        plataforma
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Logo Upload */}
                                    <div className="space-y-2">
                                        <Label>Logo de la empresa</Label>
                                        <div
                                            className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                                dragActive
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-muted-foreground/25'
                                            }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            {brandingData.logoUrl ? (
                                                <div className="space-y-2">
                                                    <img
                                                        src={
                                                            brandingData.logoUrl ||
                                                            '/placeholder.svg'
                                                        }
                                                        alt="Logo preview"
                                                        width={80}
                                                        height={80}
                                                        className="mx-auto rounded-lg object-contain"
                                                    />
                                                    <p className="text-sm text-muted-foreground">
                                                        Logo cargado
                                                        correctamente
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Arrastra tu logo aquí o
                                                        haz clic para
                                                        seleccionar
                                                    </p>
                                                </div>
                                            )}
                                            <input
                                                name="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                            />
                                        </div>
                                    </div>

                                    {/* Theme Toggle */}
                                    <div className="space-y-2">
                                        <Label>Tema predeterminado</Label>
                                        <div className="flex items-center space-x-2">
                                            <Monitor className="h-4 w-4" />
                                            <span className="text-sm">
                                                Claro
                                            </span>
                                            <Switch
                                                checked={
                                                    brandingData.defaultTheme ===
                                                    'dark'
                                                }
                                                onCheckedChange={(
                                                    checked: boolean,
                                                ) =>
                                                    setBrandingData((prev) => ({
                                                        ...prev,
                                                        defaultTheme: checked
                                                            ? 'dark'
                                                            : 'light',
                                                    }))
                                                }
                                            />
                                            <span className="text-sm">
                                                Oscuro
                                            </span>
                                        </div>
                                    </div>

                                    {/* Color Configuration */}
                                    <div className="space-y-4">
                                        <Label>Colores para tema claro</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="primaryColorLight"
                                                    className="text-sm"
                                                >
                                                    Color primario
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        id="primaryColorLight"
                                                        type="color"
                                                        value={
                                                            brandingData.theme
                                                                .light.colors
                                                                .primary
                                                        }
                                                        onChange={(e) =>
                                                            updateThemeColor(
                                                                'light',
                                                                'primary',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 w-10 cursor-pointer rounded border border-input"
                                                    />
                                                    <Input
                                                        value={
                                                            brandingData.theme
                                                                .light.colors
                                                                .primary
                                                        }
                                                        onChange={(e) =>
                                                            updateThemeColor(
                                                                'light',
                                                                'primary',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1 font-mono text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="secondaryColorLight"
                                                    className="text-sm"
                                                >
                                                    Color secundario
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        id="secondaryColorLight"
                                                        type="color"
                                                        value={
                                                            brandingData.theme
                                                                .light.colors
                                                                .secondary
                                                        }
                                                        onChange={(e) =>
                                                            updateThemeColor(
                                                                'light',
                                                                'secondary',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 w-10 cursor-pointer rounded border border-input"
                                                    />
                                                    <Input
                                                        value={
                                                            brandingData.theme
                                                                .light.colors
                                                                .secondary
                                                        }
                                                        onChange={(e) =>
                                                            updateThemeColor(
                                                                'light',
                                                                'secondary',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1 font-mono text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Label>Colores para tema oscuro</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="primaryColorDark"
                                                    className="text-sm"
                                                >
                                                    Color primario
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        id="primaryColorDark"
                                                        type="color"
                                                        value={
                                                            brandingData.theme
                                                                .dark.colors
                                                                .primary
                                                        }
                                                        onChange={(e) =>
                                                            updateThemeColor(
                                                                'dark',
                                                                'primary',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 w-10 cursor-pointer rounded border border-input"
                                                    />
                                                    <Input
                                                        value={
                                                            brandingData.theme
                                                                .dark.colors
                                                                .primary
                                                        }
                                                        onChange={(e) =>
                                                            updateThemeColor(
                                                                'dark',
                                                                'primary',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1 font-mono text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="secondaryColorDark"
                                                    className="text-sm"
                                                >
                                                    Color secundario
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        id="secondaryColorDark"
                                                        type="color"
                                                        value={
                                                            brandingData.theme
                                                                .dark.colors
                                                                .secondary
                                                        }
                                                        onChange={(e) =>
                                                            updateThemeColor(
                                                                'dark',
                                                                'secondary',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-10 w-10 cursor-pointer rounded border border-input"
                                                    />
                                                    <Input
                                                        value={
                                                            brandingData.theme
                                                                .dark.colors
                                                                .secondary
                                                        }
                                                        onChange={(e) =>
                                                            updateThemeColor(
                                                                'dark',
                                                                'secondary',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="flex-1 font-mono text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Preview Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Vista Previa del Branding
                                    </CardTitle>
                                    <CardDescription>
                                        Así se verá tu chat widget con la
                                        configuración actual
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className={`rounded-lg border-2 p-4 transition-all ${
                                            currentTheme === 'dark'
                                                ? 'border-gray-700 bg-gray-900'
                                                : 'border-gray-200 bg-white'
                                        }`}
                                    >
                                        {/* Chat Widget Preview */}
                                        <div className="space-y-3">
                                            {/* Header */}
                                            <div
                                                className="flex items-center space-x-3 rounded-t-lg p-3"
                                                style={{
                                                    backgroundColor:
                                                        currentColors.primary,
                                                }}
                                            >
                                                {brandingData.logoUrl && (
                                                    <img
                                                        src={
                                                            brandingData.logoUrl ||
                                                            '/placeholder.svg'
                                                        }
                                                        alt="Logo"
                                                        width={24}
                                                        height={24}
                                                        className="rounded"
                                                    />
                                                )}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-white">
                                                        {companyData.name ||
                                                            'Tu Empresa'}
                                                    </h4>
                                                    <p className="text-xs text-white/80">
                                                        En línea
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Chat Messages */}
                                            <div className="space-y-2 px-3">
                                                <div className="flex justify-start">
                                                    <div
                                                        className="max-w-xs rounded-lg px-3 py-2 text-sm text-white"
                                                        style={{
                                                            backgroundColor:
                                                                currentColors.secondary,
                                                        }}
                                                    >
                                                        ¡Hola! ¿En qué puedo
                                                        ayudarte hoy?
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <div
                                                        className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                                                            currentTheme ===
                                                            'dark'
                                                                ? 'bg-gray-700 text-white'
                                                                : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                    >
                                                        Necesito ayuda con mi
                                                        pedido
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Input */}
                                            <div className="px-3 pb-3">
                                                <div
                                                    className={`flex items-center space-x-2 rounded-lg border p-2 ${
                                                        currentTheme === 'dark'
                                                            ? 'border-gray-600 bg-gray-800'
                                                            : 'border-gray-300 bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        type="text"
                                                        placeholder="Escribe tu mensaje..."
                                                        className={`flex-1 bg-transparent text-sm outline-none ${
                                                            currentTheme ===
                                                            'dark'
                                                                ? 'text-white placeholder-gray-400'
                                                                : 'text-gray-900 placeholder-gray-500'
                                                        }`}
                                                        disabled
                                                    />
                                                    <button
                                                        className="rounded p-1"
                                                        style={{
                                                            backgroundColor:
                                                                currentColors.primary,
                                                        }}
                                                        disabled
                                                    >
                                                        <svg
                                                            className="h-4 w-4 text-white"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            disabled={isSubmitting}
                            tabIndex={5}
                            data-test="register-user-button"
                        >
                            {isSubmitting && (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isSubmitting
                                ? 'Creando cuenta...'
                                : 'Create account'}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <TextLink href={login()} tabIndex={6}>
                            Log in
                        </TextLink>
                    </div>
                </form>
            </main>
        </AuthLayout>
    );
}
