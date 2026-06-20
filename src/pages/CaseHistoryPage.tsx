import { Button, Card, Flex, Heading, Text, Table, TableBody, TableCell, TableHead, TableRow } from '@aws-amplify/ui-react';
import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageShell } from '../components/ui/PageShell';
import { useEntityLoader } from '../hooks/useEntityLoader';
import { useWorkspaceSnapshot } from '../hooks/useWorkspaceSnapshot';
import { formatDateTime } from '../lib/format';
import { getCase, listCaseHistory } from '../services/fluxoApi';

export function CaseHistoryPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { patients } = useWorkspaceSnapshot();
  const {
    data: alignerCase,
    loading: caseLoading,
    error: caseError,
  } = useEntityLoader(
    async () => {
      if (!caseId) {
        throw new Error('Caso não informado.');
      }

      const record = await getCase(caseId);
      if (!record) {
        throw new Error('Caso não encontrado.');
      }

      return record;
    },
    [caseId],
  );
  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
  } = useEntityLoader(
    async () => {
      if (!caseId) {
        throw new Error('Caso não informado.');
      }

      return listCaseHistory(caseId);
    },
    [caseId],
  );
  const history = historyData ?? [];

  const patient = useMemo(() => {
    if (!alignerCase) {
      return null;
    }

    return patients.find((item) => item.id === alignerCase.patientId) ?? null;
  }, [alignerCase, patients]);

  if (caseLoading || historyLoading) {
    return <LoadingState />;
  }

  if (caseError || historyError || !alignerCase) {
    return (
      <PageShell title="Histórico do caso" description="Status e observações">
        <EmptyState
          title="Não foi possível carregar o histórico"
          description={caseError ?? historyError ?? 'O caso solicitado não está disponível.'}
          actionLabel="Voltar"
          actionTo="/cases"
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Histórico - ${alignerCase.caseNumber}`}
      description={patient ? `Paciente: ${patient.name}` : 'Linha do tempo completa do caso.'}
      actions={<Button as={Link} to={`/cases/${alignerCase.id}`}>Voltar</Button>}
    >
      <Flex direction="column" gap="1rem">
        <Card variation="outlined">
          <Heading level={4}>Visão geral</Heading>
          <Text className="muted">Status atual: {alignerCase.status}</Text>
          <Text className="muted">Observações: {alignerCase.notes ?? 'Sem observações.'}</Text>
        </Card>

        {history.length === 0 ? (
          <EmptyState
            title="Sem histórico registrado"
            description="O histórico aparecerá quando o status do caso for alterado."
          />
        ) : (
          <Table highlightOnHover>
            <TableHead>
              <TableRow>
                <TableCell as="th">Quando</TableCell>
                <TableCell as="th">De</TableCell>
                <TableCell as="th">Para</TableCell>
                <TableCell as="th">Observação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDateTime(entry.createdAt)}</TableCell>
                  <TableCell>{entry.fromStatus ?? '—'}</TableCell>
                  <TableCell>{entry.toStatus}</TableCell>
                  <TableCell>{entry.note ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Flex>
    </PageShell>
  );
}
