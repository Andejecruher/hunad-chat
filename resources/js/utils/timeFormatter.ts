/**
 * Converts a time string from "HH:mm:ss" or "HH:mm" (24h) to 12-hour format with AM/PM.
 * Example: "16:30:00" → "04:30 PM"
 */
export function to12HourFormat(time: string | undefined, options?: { fallback?: string }): string {
    if (!time || typeof time !== 'string') {
        return options?.fallback ?? '--:--';
    }

    const match = time.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::[0-5][0-9])?$/);
    if (!match) {
        return options?.fallback ?? time;
    }

    let hours = parseInt(match[1]);
    const minutes = match[2];
    const suffix = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convierte 0 → 12 y 13–23 → 1–11
    return `${hours.toString().padStart(2, '0')}:${minutes} ${suffix}`;
}

/**
 * Converts a time string from 12-hour format with AM/PM to "HH:mm:ss" (24h format).
 * Example: "04:30 PM" → "16:30:00"
 */
export function to24HourFormat(time12: string | undefined, options?: { fallback?: string }): string {
    if (!time12 || typeof time12 !== 'string') {
        return options?.fallback ?? '--:--';
    }

    const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) {
        return options?.fallback ?? time12;
    }

    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
}

/**
 * Validates whether a string is a valid 24-hour time.
 * Example: "23:59:00" → true
 */
export function isValid24Hour(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9])?$/.test(time);
}

/**
 * Validates whether a string is a valid 12-hour time.
 * Example: "11:45 PM" → true
 */
export function isValid12Hour(time: string): boolean {
    return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(time);
}
