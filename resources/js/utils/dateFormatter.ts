export type DateFormatOptions = {
    locale?: string
    timeZone?: string // IANA timezone (e.g. "America/Los_Angeles") o 'local' para usar timezone del cliente
    dateStyle?: 'short' | 'medium' | 'long' | 'full'
    timeStyle?: 'short' | 'medium' | 'long' | 'full'
    // Control de formato de hora: true => 12h, false => 24h, 'auto' => dejar que Intl decida
    hour12?: boolean | 'auto'
    fallback?: string
}

/**
 * Normaliza distintos inputs a Date. Retorna null si no se puede parsear.
 */
export function parseDate(input?: string | number | Date): Date | null {
    if (!input && input !== 0) return null
    if (input instanceof Date) {
        return isNaN(input.getTime()) ? null : input
    }
    const d = new Date(input as string | number | Date)
    return isNaN(d.getTime()) ? null : d
}

/**
 * Formatea usando Intl.DateTimeFormat respetando timezone si se provee.
 * Si sólo quieres fecha, omite timeStyle; para fecha+hora incluye ambos.
 */
export function formatDate(
    input?: string | number | Date,
    opts?: DateFormatOptions,
): string {
    const fallback = opts?.fallback ?? '—'
    const d = parseDate(input)
    if (!d) return fallback

    const locale = opts?.locale ?? 'es-ES'
    const intlOpts: Intl.DateTimeFormatOptions = {
        dateStyle: opts?.dateStyle ?? 'medium',
    }
    if (opts?.timeStyle) intlOpts.timeStyle = opts.timeStyle
    // Si se pasa explicitamente booleano, lo aplicamos. 'auto' o undefined => Intl decide.
    if (typeof opts?.hour12 === 'boolean') {
        intlOpts.hour12 = opts!.hour12
    }
    if (opts?.timeZone && opts.timeZone !== 'local') {
        // cuando es 'local' dejamos que Intl use la zona del runtime
        intlOpts.timeZone = opts.timeZone
    }

    try {
        return new Intl.DateTimeFormat(locale, intlOpts).format(d)
    } catch {
        return d.toString()
    }
}

/**
 * Devuelve ISO (UTC) o null si no parsea.
 */
export function toISO(input?: string | number | Date): string | null {
    const d = parseDate(input)
    return d ? d.toISOString() : null
}

/**
 * Partes de la fecha en una zona horaria dada (útil para construir fechas "en" esa zona).
 */
export function toTimeZoneParts(
    input?: string | number | Date,
    timeZone?: string,
    locale = 'es-ES',
    // por compatibilidad con comportamiento previo, por defecto usamos 24h
    hour12: boolean = false,
) {
    const d = parseDate(input)
    if (!d) return null

    const fmt = new Intl.DateTimeFormat(locale, {
        timeZone: timeZone === 'local' ? undefined : timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12,
    })
    const parts = fmt.formatToParts(d)
    const map: Record<string, string> = {}
    for (const p of parts) {
        if (p.type !== 'literal') map[p.type] = p.value
    }
    return {
        year: map.year,
        month: map.month,
        day: map.day,
        hour: map.hour,
        minute: map.minute,
        second: map.second,
    }
}

/**
 * Relative time (ej. "hace 3 días", "dentro de 2 horas")
 */
export function formatRelative(
    input?: string | number | Date,
    base: Date | number = Date.now(),
    locale = 'es-ES',
): string {
    const d = parseDate(input)
    if (!d) return '—'
    const diffSeconds = Math.round((d.getTime() - (base instanceof Date ? base.getTime() : base)) / 1000)
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    const divisions: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
        { amount: 60, name: 'second' },
        { amount: 60, name: 'minute' },
        { amount: 24, name: 'hour' },
        { amount: 7, name: 'day' },
        { amount: 4.34524, name: 'week' }, // aprox
        { amount: 12, name: 'month' },
        { amount: Number.POSITIVE_INFINITY, name: 'year' },
    ]

    let unit: Intl.RelativeTimeFormatUnit = 'second'
    let value = diffSeconds
    let absValue = Math.abs(value)

    for (let i = 0, s = absValue; i < divisions.length; i++) {
        const div = divisions[i]
        if (Math.abs(s) < div.amount) {
            unit = div.name
            break
        }
        s = Math.round(s / div.amount)
        value = Math.round(value / div.amount)
        absValue = Math.abs(s)
    }

    return rtf.format(value as number, unit)
}

/**
 * Start / End of day en UTC (útiles para queries backend).
 */
export function startOfDayUTC(input?: string | number | Date): Date | null {
    const d = parseDate(input) ?? new Date()
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0))
}
export function endOfDayUTC(input?: string | number | Date): Date | null {
    const d = parseDate(input) ?? new Date()
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999))
}