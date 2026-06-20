import { Button, Card, Flex, Heading, SelectField, Text, TextAreaField } from '@aws-amplify/ui-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { CaseForm } from '../components/forms/CaseForm';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageShell } from '../components/ui/PageShell';
import { PriorityBadge, StatusBadge } from '../components/ui/StatusBadge';
import { useEntityLoader } from '../hooks/useEntityLoader';
import { useWorkspaceSnapshot } from '../hooks/useWorkspaceSnapshot';
import { CASE_STATUSES } from '../lib/domain';
import { formatDate, formatDateTime, normalizeOptional } from '../lib/format';
import {
  getCase,
  refreshCaseWithHistory,
  updateCase,
  deleteCase,
} from '../services/fluxoApi';

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { patients } = useWorkspaceSnapshot();
  const [busy, setBusy] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const { data: alignerCase, loading, error } = useEntityLoader(
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

  const patient = useMemo(() => {
    if (!alignerCase) {
      return null;
    }

    return patients.find((item) => item.id === alignerCase.patientId) ?? null;
  }, [alignerCase, patients]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !alignerCase) {
    return (
      <PageShell title="Detalhe do caso" description="Acompanhamento da produção">
        <EmptyState
          title="Caso indisponível"
          description={error ?? 'O registro solicitado não existe ou não está acessível.'}
          actionLabel="Voltar"
          actionTo="/cases"
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`${alignerCase.caseNumber} - ${alignerCase.title}`}
      description="Detalhes operacionais, status e vínculos clínicos."
      actions={
        <Button
          variation="destructive"
          isLoading={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await deleteCase(alignerCase.id);
              navigate('/cases');
            } finally {
              setBusy(false);
            }
          }}
        >
          Excluir caso
        </Button>
      }
    >
      <Flex direction="column" gap="1.25rem">
        <Card variation="outlined">
          <Flex justifyContent="space-between" wrap="wrap" gap="0.75rem">
            <div>
              <Text className="muted">Paciente vinculado</Text>
              <Heading level={4}>{patient?.name ?? 'Paciente indisponível'}</Heading>
            </div>
            <Flex gap="0.5rem" wrap="wrap">
              <StatusBadge status={alignerCase.status} />
              <PriorityBadge priority={alignerCase.priority} />
            </Flex>
          </Flex>
          <Text className="muted">Prazo: {formatDate(alignerCase.dueDate)}</Text>
          <Text className="muted">Criado em: {formatDateTime(alignerCase.createdAt)}</Text>
        </Card>

        <Card variation="outlined">
          <Heading level={4}>Editar caso</Heading>
          <CaseForm
            patients={patients}
            initialValues={alignerCase}
            submitLabel="Salvar alterações"
            busy={busy}
            onSubmit={async (values) => {
              setBusy(true);
              try {
                await updateCase({ id: alignerCase.id, ...values });
              } finally {
                setBusy(false);
              }
            }}
          />
        </Card>

        <Card variation="outlined">
          <Heading level={4}>Mover status</Heading>
          <Flex direction="column" gap="1rem">
            <SelectField
              label="Novo status"
              value={alignerCase.status}
              onChange={async (event) => {
                const nextStatus = event.target.value as (typeof CASE_STATUSES)[number];
                if (nextStatus === alignerCase.status) {
                  return;
                }

                setBusy(true);
                try {
                  await refreshCaseWithHistory(alignerCase.id, nextStatus, normalizeOptional(statusNote));
                  setStatusNote('');
                  window.location.reload();
                } finally {
                  setBusy(false);
                }
              }}
            >
              {CASE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </SelectField>
            <TextAreaField
              label="Observação do movimento"
              value={statusNote}
              onChange={(event) => setStatusNote(event.target.value)}
              placeholder="Anote o motivo da alteração de status"
            />
          </Flex>
        </Card>

        <Card variation="outlined">
          <Heading level={4}>Observações</Heading>
          <Text className="muted">{alignerCase.notes ?? 'Sem observações registradas.'}</Text>
        </Card>

        <Card variation="outlined">
          <Flex justifyContent="space-between" wrap="wrap" gap="0.75rem">
            <Heading level={4}>Recursos do caso</Heading>
            <Flex gap="0.5rem" wrap="wrap">
              <Button as={Link} to={`/cases/${alignerCase.id}/uploads`}>
                Uploads
              </Button>
              <Button as={Link} to={`/cases/${alignerCase.id}/history`}>
                Histórico
              </Button>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </PageShell>
  );
}
