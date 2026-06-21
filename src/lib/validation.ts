import { CASE_STATUSES, ARCH_OPTIONS, PRIORITY_LEVELS, type CaseInput, type PatientInput } from './domain';
import { normalizePhoneNumber } from './format';

export type FieldErrors = Record<string, string>;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

export function validatePatient(values: PatientInput) {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Informe o nome do paciente.';
  }

  if (values.email && !isEmail(values.email)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (values.phone && !normalizePhoneNumber(values.phone)) {
    errors.phone = 'Informe um telefone válido com DDD. Exemplo: +5571996527148 ou 71996527148.';
  }

  if (values.birthDate && !isDate(values.birthDate)) {
    errors.birthDate = 'Informe uma data válida.';
  }

  return errors;
}

export function validateCase(values: CaseInput) {
  const errors: FieldErrors = {};

  if (!values.patientId.trim()) {
    errors.patientId = 'Selecione um paciente.';
  }

  if (!values.caseNumber.trim()) {
    errors.caseNumber = 'Informe o número do caso.';
  }

  if (!values.title.trim()) {
    errors.title = 'Informe o título do caso.';
  }

  if (!CASE_STATUSES.includes(values.status)) {
    errors.status = 'Selecione um status válido.';
  }

  if (values.dueDate && !isDate(values.dueDate)) {
    errors.dueDate = 'Informe uma data válida.';
  }

  if (values.quantityOfAligners != null && Number.isNaN(Number(values.quantityOfAligners))) {
    errors.quantityOfAligners = 'Informe uma quantidade válida.';
  }

  if (values.priority && !PRIORITY_LEVELS.includes(values.priority)) {
    errors.priority = 'Selecione uma prioridade válida.';
  }

  if (values.upperArch && !ARCH_OPTIONS.includes(values.upperArch)) {
    errors.upperArch = 'Selecione uma opção válida.';
  }

  if (values.lowerArch && !ARCH_OPTIONS.includes(values.lowerArch)) {
    errors.lowerArch = 'Selecione uma opção válida.';
  }

  return errors;
}
