import { useEffect, useMemo, useState } from 'react';
import type { AlignerCaseRecord, CaseFileRecord, CaseStatusHistoryRecord, PatientRecord } from '../lib/domain';
import { listAllCaseFiles, listAllCaseHistory, listCases, listPatients } from '../services/fluxoApi';

interface WorkspaceSnapshot {
  patients: PatientRecord[];
  cases: AlignerCaseRecord[];
  history: CaseStatusHistoryRecord[];
  files: CaseFileRecord[];
}

export function useWorkspaceSnapshot() {
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>({
    patients: [],
    cases: [],
    history: [],
    files: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [patients, cases, history, files] = await Promise.all([
        listPatients(),
        listCases(),
        listAllCaseHistory(),
        listAllCaseFiles(),
      ]);

      setSnapshot({ patients, cases, history, files });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const derived = useMemo(() => snapshot, [snapshot]);

  return {
    ...derived,
    loading,
    error,
    refresh,
  };
}
