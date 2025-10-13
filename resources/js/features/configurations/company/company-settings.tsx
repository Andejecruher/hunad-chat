import InputError from '@/components/input-error';
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
import company from '@/routes/company';
import {
    CompanySettings as CompanySettingsTypes,
    User,
    ValidationErrors,
} from '@/types';
import { router } from '@inertiajs/react';
import { Building2, Monitor, Palette, Save, Upload } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function CompanySettings({
    user,
    companyData,
}: {
    user: User;
    companyData: CompanySettingsTypes;
}) {
    const [companySettings, setCompanySettings] =
        useState<CompanySettingsTypes>({
            name: '',
            slug: '',
            branding: {
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
                logo_url: '',
                default_theme: 'light',
            },
        });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        setIsLoading(true);
        // valid exist company
        if (companyData) {
            setCompanySettings(companyData);
            setIsLoading(false);
        }
    }, [companyData, user]);

    // function to logo upload and preview
    function getLogoUrl(logo_url: string): string {
        if (!logo_url) return '/placeholder.svg';
        if (
            logo_url.startsWith('http://') ||
            logo_url.startsWith('https://') ||
            logo_url.startsWith('data:') ||
            logo_url.startsWith('blob:')
        ) {
            return logo_url;
        }
        // Si es local, asume que está en storage/logos
        return `${import.meta.env.VITE_APP_URL}/storage/${logo_url.replace(/^\/?storage\/logos\//, '')}`;
    }

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
        setCompanySettings((prev) => ({
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
                setCompanySettings((prev) => ({
                    ...prev,
                    branding: { ...prev.branding, logo_url: url },
                }));
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const url = URL.createObjectURL(file);
            setCompanySettings((prev) => ({
                ...prev,
                branding: { ...prev.branding, logo_url: url },
            }));
        }
    };

    const updateThemeColor = (
        theme: 'light' | 'dark',
        colorType: 'primary' | 'secondary',
        color: string,
    ) => {
        setCompanySettings((prev) => ({
            ...prev,
            branding: {
                ...prev.branding,
                theme: {
                    ...prev.branding.theme,
                    [theme]: {
                        ...prev.branding.theme[theme],
                        colors: {
                            ...prev.branding.theme[theme].colors,
                            [colorType]: color,
                        },
                    },
                },
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({});

        // Basic validation
        if (!companySettings.name || !companySettings.slug) {
            toast.error('Por favor completa los datos de la empresa');
            setIsSaving(false);
            return;
        }

        if (companySettings.name.length < 2) {
            toast.error(
                'El nombre de la empresa debe tener al menos 2 caracteres',
            );
            setIsSaving(false);
            return;
        }

        try {
            // Preparar datos para envío
            const formData = new FormData();

            if (!companySettings.id) {
                toast.error('ID de la empresa no encontrado.');
                setIsSaving(false);
                return;
            }

            // Agregar el campo _method para method spoofing
            formData.append('_method', 'PUT');

            // Datos de la empresa
            formData.append('company_name', companySettings.name);
            formData.append('company_slug', companySettings.slug);
            formData.append(
                'subscription_type',
                companySettings.subscription_type || 'free',
            );

            // Datos de branding
            formData.append(
                'branding_theme',
                JSON.stringify(companySettings.branding.theme),
            );
            formData.append(
                'branding_default_theme',
                companySettings.branding.default_theme,
            );

            // Logo si existe
            if (logoFile) {
                console.log(logoFile);
                formData.append('branding_logo', logoFile);
            }

            // Enviar usando Inertia con POST para que funcione con multipart/form-data
            router.post(
                company.update({ company: companySettings?.id }).url,
                formData,
                {
                    forceFormData: true,
                    onSuccess: (page) => {
                        toast.success(
                            '¡Configuración de empresa actualizada exitosamente!',
                        );
                        // Actualizar el estado local con los datos actualizados si vienen en la respuesta
                        if (page.props.company) {
                            setCompanySettings(
                                page.props.company as CompanySettingsTypes,
                            );
                        }
                        // Limpiar el archivo de logo ya que se guardó
                        setLogoFile(null);
                    },
                    onError: (errors) => {
                        setErrors(errors);
                        console.error('Errores de validación:', errors);

                        // Mostrar errores específicos
                        if (errors.company_name) {
                            toast.error(`Nombre: ${errors.company_name}`);
                        } else if (errors.company_slug) {
                            toast.error(`Slug: ${errors.company_slug}`);
                        } else if (errors.branding_logo) {
                            toast.error(`Logo: ${errors.branding_logo}`);
                        } else if (errors.error) {
                            toast.error(errors.error);
                        } else {
                            toast.error(
                                'Error al actualizar la configuración. Por favor verifica los datos e intenta nuevamente.',
                            );
                        }
                    },
                    onFinish: () => {
                        setIsSaving(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error inesperado:', error);
            toast.error(`Error inesperado durante la actualización: ${error}`);
            setIsSaving(false);
        }
    };

    const currentTheme = companySettings.branding.default_theme;
    const currentColors = companySettings.branding.theme[currentTheme]?.colors;

    if (isLoading) {
        return (
            <main className="container mx-auto flex h-full max-w-6xl flex-1 items-center justify-center px-4 py-8">
                <div className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">
                            Cargando configuración de la empresa...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <section className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="mb-4 font-heading text-4xl font-bold text-foreground">
                    Configuración de Empresa
                </h1>
                <p className="text-xl text-muted-foreground">
                    Administra los datos y personalización de tu plataforma
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid gap-8 xl:grid-cols-3">
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
                                    value={companySettings.name}
                                    onChange={(e) =>
                                        handleCompanyNameChange(e.target.value)
                                    }
                                    placeholder="Mi Empresa S.A."
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
                                    id="companySlug"
                                    value={companySettings.slug}
                                    onChange={(e) =>
                                        setCompanySettings((prev) => ({
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
                                    {companySettings.slug}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Branding Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Branding y Personalización
                            </CardTitle>
                            <CardDescription>
                                Personaliza la apariencia de tu plataforma
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
                                    {companySettings.branding.logo_url ? (
                                        <div className="space-y-2">
                                            <img
                                                src={
                                                    getLogoUrl(
                                                        companySettings.branding
                                                            .logo_url,
                                                    ) || '/placeholder.svg'
                                                }
                                                alt="Logo preview"
                                                width={80}
                                                height={80}
                                                className="mx-auto rounded-lg object-contain"
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Logo cargado correctamente
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                Arrastra tu logo aquí o haz clic
                                                para seleccionar
                                            </p>
                                        </div>
                                    )}
                                    <input
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
                                    <span className="text-sm">Claro</span>
                                    <Switch
                                        checked={
                                            companySettings.branding
                                                .default_theme === 'dark'
                                        }
                                        onCheckedChange={(checked) =>
                                            setCompanySettings((prev) => ({
                                                ...prev,
                                                branding: {
                                                    ...prev.branding,
                                                    default_theme: checked
                                                        ? 'dark'
                                                        : 'light',
                                                },
                                            }))
                                        }
                                    />
                                    <span className="text-sm">Oscuro</span>
                                </div>
                            </div>

                            {/* Color Configuration */}
                            <div className="space-y-4">
                                <Label>Colores para tema claro</Label>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="primaryColor"
                                            className="text-sm"
                                        >
                                            Color primario
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                id="primaryColor"
                                                type="color"
                                                value={
                                                    companySettings.branding
                                                        .theme['light'].colors
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
                                                    companySettings.branding
                                                        .theme['light'].colors
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
                                            htmlFor="secondaryColor"
                                            className="text-sm"
                                        >
                                            Color secundario
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                id="secondaryColor"
                                                type="color"
                                                value={
                                                    companySettings.branding
                                                        .theme['light'].colors
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
                                                    companySettings.branding
                                                        .theme['light'].colors
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
                            </div>
                            {/* Color Configuration */}
                            <div className="space-y-4">
                                <Label>Colores para tema oscuro</Label>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="primaryColor"
                                            className="text-sm"
                                        >
                                            Color primario
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                id="primaryColor"
                                                type="color"
                                                value={
                                                    companySettings.branding
                                                        .theme['dark'].colors
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
                                                    companySettings.branding
                                                        .theme['dark'].colors
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
                                            htmlFor="secondaryColor"
                                            className="text-sm"
                                        >
                                            Color secundario
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                id="secondaryColor"
                                                type="color"
                                                value={
                                                    companySettings.branding
                                                        .theme['dark'].colors
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
                                                    companySettings.branding
                                                        .theme['dark'].colors
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
                            <CardTitle>Vista Previa del Branding</CardTitle>
                            <CardDescription>
                                Así se verá tu chat widget con la configuración
                                actual
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
                                        {companySettings.branding.logo_url && (
                                            <img
                                                src={
                                                    getLogoUrl(
                                                        companySettings.branding
                                                            .logo_url,
                                                    ) || '/placeholder.svg'
                                                }
                                                alt="Logo"
                                                width={24}
                                                height={24}
                                                className="rounded"
                                            />
                                        )}
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">
                                                {companySettings.name ||
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
                                                ¡Hola! ¿En qué puedo ayudarte
                                                hoy?
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <div
                                                className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                                                    currentTheme === 'dark'
                                                        ? 'bg-gray-700 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                }`}
                                            >
                                                Necesito ayuda con mi pedido
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
                                                    currentTheme === 'dark'
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

                {/* Submit Button */}
                <div className="flex justify-center pt-3">
                    <Button
                        type="submit"
                        size="lg"
                        className="px-8"
                        disabled={isSaving}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                </div>
            </form>
        </section>
    );
}
