import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';
import type {
  AlignerCaseRecord,
  CaseFileRecord,
  CaseInput,
  CaseStatus,
  CaseStatusHistoryRecord,
  CaseUpdateInput,
  PatientInput,
  PatientRecord,
  PatientUpdateInput,
} from '../lib/domain';

const client = generateClient<Schema>({ authMode: 'userPool' });

type ListResult<T> = {
  data?: T[] | null;
  errors?: Array<{ message?: string } | null> | null;
};

type ItemResult<T> = {
  data?: T | null;
  errors?: Array<{ message?: string } | null> | null;
};

function assertNoErrors(errors?: Array<{ message?: string } | null> | null) {
  const messages = (errors ?? []).flatMap((error) => (error?.message ? [error.message] : []));
  if (messages.length > 0) {
    throw new Error(messages.join('\n'));
  }
}

function normalizeItems<T>(result: ListResult<T>): T[] {
  assertNoErrors(result.errors);
  return (result.data ?? []).filter(Boolean) as T[];
}

function normalizeItem<T>(result: ItemResult<T>): T | null {
  assertNoErrors(result.errors);
  return result.data ?? null;
}

function sortByDateDesc<T extends { createdAt?: string | null }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return rightDate - leftDate;
  });
}

function sanitizeText(value: string) {
  return value.trim();
}

async function getIdentityId() {
  const session = await fetchAuthSession();
  if (!session.identityId) {
    throw new Error('Não foi possível obter o identityId do usuário autenticado.');
  }
  return session.identityId;
}

export async function listPatients(): Promise<PatientRecord[]> {
  const result = await client.models.Patient.list();
  return sortByDateDesc(normalizeItems<PatientRecord>(result as ListResult<PatientRecord>));
}

export async function getPatient(id: string): Promise<PatientRecord | null> {
  const result = await client.models.Patient.get({ id });
  return normalizeItem(result as ItemResult<PatientRecord>);
}

export async function createPatient(input: PatientInput): Promise<PatientRecord> {
  const result = await client.models.Patient.create({
    name: sanitizeText(input.name),
    birthDate: input.birthDate || undefined,
    document: input.document?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    email: input.email?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  });

  const patient = normalizeItem(result as ItemResult<PatientRecord>);
  if (!patient) {
    throw new Error('Falha ao criar paciente.');
  }

  return patient;
}

export async function updatePatient(input: PatientUpdateInput): Promise<PatientRecord> {
  const result = await client.models.Patient.update({
    id: input.id,
    name: sanitizeText(input.name),
    birthDate: input.birthDate || undefined,
    document: input.document?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    email: input.email?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  });

  const patient = normalizeItem(result as ItemResult<PatientRecord>);
  if (!patient) {
    throw new Error('Falha ao atualizar paciente.');
  }

  return patient;
}

export async function deletePatient(id: string) {
  const cases = await listCases();
  const patientCases = cases.filter((alignerCase) => alignerCase.patientId === id);

  await Promise.all(patientCases.map((alignerCase) => deleteCase(alignerCase.id)));

  const result = await client.models.Patient.delete({ id });
  assertNoErrors((result as { errors?: Array<{ message?: string } | null> | null }).errors);
}

export async function listCases(): Promise<AlignerCaseRecord[]> {
  const result = await client.models.AlignerCase.list();
  return sortByDateDesc(normalizeItems<AlignerCaseRecord>(result as ListResult<AlignerCaseRecord>));
}

export async function getCase(id: string): Promise<AlignerCaseRecord | null> {
  const result = await client.models.AlignerCase.get({ id });
  return normalizeItem(result as ItemResult<AlignerCaseRecord>);
}

export async function createCase(input: CaseInput): Promise<AlignerCaseRecord> {
  const result = await client.models.AlignerCase.create({
    patientId: input.patientId,
    caseNumber: sanitizeText(input.caseNumber),
    title: sanitizeText(input.title),
    status: input.status,
    upperArch: input.upperArch || undefined,
    lowerArch: input.lowerArch || undefined,
    quantityOfAligners: input.quantityOfAligners ?? undefined,
    priority: input.priority || undefined,
    dueDate: input.dueDate || undefined,
    notes: input.notes?.trim() || undefined,
  });

  const alignerCase = normalizeItem(result as ItemResult<AlignerCaseRecord>);
  if (!alignerCase) {
    throw new Error('Falha ao criar caso.');
  }

  await createStatusHistory({
    caseId: alignerCase.id,
    toStatus: alignerCase.status,
    note: 'Caso criado',
  });

  return alignerCase;
}

export async function updateCase(input: CaseUpdateInput): Promise<AlignerCaseRecord> {
  const current = await getCase(input.id);
  if (!current) {
    throw new Error('Caso não encontrado.');
  }

  const result = await client.models.AlignerCase.update({
    id: input.id,
    patientId: input.patientId,
    caseNumber: sanitizeText(input.caseNumber),
    title: sanitizeText(input.title),
    status: input.status,
    upperArch: input.upperArch || undefined,
    lowerArch: input.lowerArch || undefined,
    quantityOfAligners: input.quantityOfAligners ?? undefined,
    priority: input.priority || undefined,
    dueDate: input.dueDate || undefined,
    notes: input.notes?.trim() || undefined,
  });

  const updated = normalizeItem(result as ItemResult<AlignerCaseRecord>);
  if (!updated) {
    throw new Error('Falha ao atualizar caso.');
  }

  if (current.status !== updated.status) {
    await createStatusHistory({
      caseId: updated.id,
      fromStatus: current.status,
      toStatus: updated.status,
      note: `Status alterado de ${current.status} para ${updated.status}`,
    });
  }

  return updated;
}

export async function deleteCase(id: string) {
  const files = await listCaseFiles(id);
  await Promise.all(
    files.map(async (file) => {
      await removeCaseFileFromStorage(file.fileKey);
      const deleteResult = await client.models.CaseFile.delete({ id: file.id });
      assertNoErrors((deleteResult as { errors?: Array<{ message?: string } | null> | null }).errors);
    }),
  );

  const histories = await listCaseHistory(id);
  await Promise.all(
    histories.map(async (history) => {
      const deleteResult = await client.models.CaseStatusHistory.delete({ id: history.id });
      assertNoErrors((deleteResult as { errors?: Array<{ message?: string } | null> | null }).errors);
    }),
  );

  const result = await client.models.AlignerCase.delete({ id });
  assertNoErrors((result as { errors?: Array<{ message?: string } | null> | null }).errors);
}

export async function listCaseHistory(caseId: string): Promise<CaseStatusHistoryRecord[]> {
  const result = await client.models.CaseStatusHistory.list();
  const items = normalizeItems<CaseStatusHistoryRecord>(
    result as ListResult<CaseStatusHistoryRecord>,
  ).filter((history) => history.caseId === caseId);
  return sortByDateDesc(items);
}

export async function createStatusHistory(input: {
  caseId: string;
  fromStatus?: CaseStatus;
  toStatus: CaseStatus;
  note?: string;
}): Promise<CaseStatusHistoryRecord> {
  const result = await client.models.CaseStatusHistory.create({
    caseId: input.caseId,
    fromStatus: input.fromStatus || undefined,
    toStatus: input.toStatus,
    note: input.note?.trim() || undefined,
  });

  const history = normalizeItem(result as ItemResult<CaseStatusHistoryRecord>);
  if (!history) {
    throw new Error('Falha ao registrar histórico do status.');
  }

  return history;
}

export async function listCaseFiles(caseId: string): Promise<CaseFileRecord[]> {
  const result = await client.models.CaseFile.list();
  const items = normalizeItems<CaseFileRecord>(result as ListResult<CaseFileRecord>).filter(
    (file) => file.caseId === caseId,
  );
  return sortByDateDesc(items);
}

export async function createCaseFileRecord(input: {
  caseId: string;
  fileName: string;
  fileKey: string;
  contentType?: string;
  size?: number;
}): Promise<CaseFileRecord> {
  const result = await client.models.CaseFile.create({
    caseId: input.caseId,
    fileName: input.fileName,
    fileKey: input.fileKey,
    contentType: input.contentType,
    size: input.size,
  });

  const file = normalizeItem(result as ItemResult<CaseFileRecord>);
  if (!file) {
    throw new Error('Falha ao registrar arquivo.');
  }

  return file;
}

export async function deleteCaseFile(fileId: string) {
  const file = await client.models.CaseFile.get({ id: fileId });
  const normalized = normalizeItem(file as ItemResult<CaseFileRecord>);
  if (normalized) {
    await removeCaseFileFromStorage(normalized.fileKey);
  }

  const result = await client.models.CaseFile.delete({ id: fileId });
  assertNoErrors((result as { errors?: Array<{ message?: string } | null> | null }).errors);
}

export async function getCaseFileUrl(fileKey: string) {
  const { getUrl } = await import('aws-amplify/storage');
  const result = await getUrl({ path: fileKey });
  return result.url.toString();
}

export async function uploadCaseFile(caseId: string, file: File) {
  const { uploadData } = await import('aws-amplify/storage');
  const identityId = await getIdentityId();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
  const path = `cases/${identityId}/${caseId}/${Date.now()}-${safeFileName}`;

  const task = uploadData({
    path,
    data: file,
    options: {
      contentType: file.type || 'application/octet-stream',
    },
  });

  await task.result;

  return {
    fileName: file.name,
    fileKey: path,
    contentType: file.type || 'application/octet-stream',
    size: file.size,
  };
}

export async function listDashboardSummary() {
  const [patients, cases, history, files] = await Promise.all([
    listPatients(),
    listCases(),
    listAllCaseHistory(),
    listAllCaseFiles(),
  ]);

  return { patients, cases, history, files };
}

export async function listAllCaseHistory(): Promise<CaseStatusHistoryRecord[]> {
  const result = await client.models.CaseStatusHistory.list();
  return sortByDateDesc(normalizeItems<CaseStatusHistoryRecord>(result as ListResult<CaseStatusHistoryRecord>));
}

export async function listAllCaseFiles(): Promise<CaseFileRecord[]> {
  const result = await client.models.CaseFile.list();
  return sortByDateDesc(normalizeItems<CaseFileRecord>(result as ListResult<CaseFileRecord>));
}

export async function removeCaseFileFromStorage(fileKey: string) {
  const { remove } = await import('aws-amplify/storage');
  await remove({ path: fileKey });
}

export async function refreshCaseWithHistory(caseId: string, nextStatus: CaseStatus, note?: string) {
  const current = await getCase(caseId);
  if (!current) {
    throw new Error('Caso não encontrado.');
  }

  if (current.status === nextStatus) {
    return current;
  }

  const updated = await client.models.AlignerCase.update({
    id: caseId,
    patientId: current.patientId,
    caseNumber: current.caseNumber,
    title: current.title,
    status: nextStatus,
    upperArch: current.upperArch || undefined,
    lowerArch: current.lowerArch || undefined,
    quantityOfAligners: current.quantityOfAligners ?? undefined,
    priority: current.priority || undefined,
    dueDate: current.dueDate || undefined,
    notes: current.notes || undefined,
  });

  const normalized = normalizeItem(updated as ItemResult<AlignerCaseRecord>);
  if (!normalized) {
    throw new Error('Falha ao alterar status.');
  }

  await createStatusHistory({
    caseId,
    fromStatus: current.status,
    toStatus: nextStatus,
    note,
  });

  return normalized;
}
