import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LOCALE_MAP: Record<string, { intl: string; currency: string }> = {
  it: { intl: 'it-IT', currency: 'EUR' },
  en: { intl: 'en-US', currency: 'USD' },
};

const intl = (locale: string) => (LOCALE_MAP[locale] ?? LOCALE_MAP.en).intl;

export function formatCurrency(amount: number, locale = 'en'): string {
  if (amount === 0) return 'Free';
  const { intl: intlLocale, currency } = LOCALE_MAP[locale] ?? LOCALE_MAP.en;
  return new Intl.NumberFormat(intlLocale, { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string | Date, locale = 'en'): string {
  return new Intl.DateTimeFormat(intl(locale), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date, locale = 'en'): string {
  return new Intl.DateTimeFormat(intl(locale), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}
