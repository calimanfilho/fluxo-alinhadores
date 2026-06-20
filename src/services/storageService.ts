import { formatBytes } from '../lib/format';
import type { CaseFileRecord } from '../lib/domain';
import {
  createCaseFileRecord,
  deleteCaseFile,
  getCaseFileUrl,
  listCaseFiles,
  removeCaseFileFromStorage,
  uploadCaseFile,
} from './fluxoApi';

export async function uploadFilesForCase(caseId: string, files: File[]) {
  const created = await Promise.all(
    files.map(async (file) => {
      const stored = await uploadCaseFile(caseId, file);
      return createCaseFileRecord({
        caseId,
        ...stored,
      });
    }),
  );

  return created;
}

export async function loadFilesForCase(caseId: string): Promise<CaseFileRecord[]> {
  return listCaseFiles(caseId);
}

export async function openCaseFile(fileKey: string) {
  return getCaseFileUrl(fileKey);
}

export async function removeCaseAttachment(fileId: string) {
  return deleteCaseFile(fileId);
}

export async function removeCaseAttachmentByKey(fileKey: string) {
  return removeCaseFileFromStorage(fileKey);
}

export function describeFileSize(size?: number | null) {
  return formatBytes(size);
}
