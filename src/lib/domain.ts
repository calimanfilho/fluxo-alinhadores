export const CASE_STATUSES = [
  'received',
  'planned',
  'approved',
  'printed',
  'thermoformed',
  'trimmed',
  'polished',
  'quality',
  'delivered',
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export const PRIORITY_LEVELS = ['low', 'normal', 'high', 'urgent'] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const ARCH_OPTIONS = ['none', 'full', 'partial', 'pending'] as const;
export type ArchSelection = (typeof ARCH_OPTIONS)[number];

export interface PatientRecord {
  id: string;
  owner?: string | null;
  name: string;
  birthDate?: string | null;
  document?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AlignerCaseRecord {
  id: string;
  owner?: string | null;
  patientId: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  upperArch?: ArchSelection | null;
  lowerArch?: ArchSelection | null;
  quantityOfAligners?: number | null;
  priority?: PriorityLevel | null;
  dueDate?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CaseStatusHistoryRecord {
  id: string;
  owner?: string | null;
  caseId: string;
  fromStatus?: CaseStatus | null;
  toStatus: CaseStatus;
  note?: string | null;
  createdAt?: string | null;
}

export interface CaseFileRecord {
  id: string;
  owner?: string | null;
  caseId: string;
  fileName: string;
  fileKey: string;
  contentType?: string | null;
  size?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PatientInput {
  name: string;
  birthDate?: string;
  document?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface CaseInput {
  patientId: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  upperArch?: ArchSelection;
  lowerArch?: ArchSelection;
  quantityOfAligners?: number;
  priority?: PriorityLevel;
  dueDate?: string;
  notes?: string;
}

export interface CaseUpdateInput extends CaseInput {
  id: string;
}

export interface PatientUpdateInput extends PatientInput {
  id: string;
}

export interface ValidationErrors<T extends string> {
  [key: string]: T | undefined;
}
