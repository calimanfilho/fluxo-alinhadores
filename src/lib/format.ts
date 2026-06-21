export function formatDate(value?: string | null) {
  if (!value) {
    return 'Não informado';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
  }).format(date);
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return 'Não informado';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function toInputDate(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

export function safeTrim(value: string) {
  return value.trim();
}

export function normalizeOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizePhoneNumber(value?: string | null) {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return undefined;
  }

  const compact = trimmed.replace(/[^\d+]/g, '');
  if (compact.startsWith('+')) {
    return /^\+\d{8,15}$/.test(compact) ? compact : undefined;
  }

  const digits = compact.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  if (digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }

  return undefined;
}

export function formatBytes(size?: number | null) {
  if (!size || size <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function lowerCaseIncludes(source: string, target: string) {
  return source.toLowerCase().includes(target.toLowerCase());
}
