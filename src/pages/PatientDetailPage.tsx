import { Button, Card, Flex, Heading, Table, TableBody, TableCell, TableHead, TableRow, Text } from '@aws-amplify/ui-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { PatientForm } from '../components/forms/PatientForm';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageShell } from '../components/ui/PageShell';
import { useEntityLoader } from '../hooks/useEntityLoader';
import { useWorkspaceSnapshot } from '../hooks/useWorkspaceSnapshot';
import { formatDate } from '../lib/format';
import { deletePatient, getPatient, updatePatient } from '../services/fluxoApi';

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { cases } = useWorkspaceSnapshot();
  const { data: patient, loading, error } = useEntityLoader(
    async () => {
      if (!patientId) {
        throw new Error('Paciente não informado.');
      }

      const record = await getPatient(patientId);
      if (!record) {
        throw new Error('Paciente não encontrado.');
      }

      return record;
    },
    [patientId],
  );

  const patientCases = useMemo(() => {
    if (!patient) {
      return [];
    }

    return cases.filter((item) => item.patientId === patient.id);
  }, [cases, patient]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !patient) {
    return (
      <PageShell title="Detalhe do paciente" description="Informações clínicas e casos relacionados">
        <EmptyState
          title="Paciente indisponível"
          description={error ?? 'O registro solicitado não existe ou não está acessível.'}
          actionLabel="Voltar"
          actionTo="/patients"
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={patient.name}
      description="Informações clínicas, observações e casos vinculados."
      actions={
        <Button
          variation="destructive"
          isLoading={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await deletePatient(patient.id);
              navigate('/patients');
            } finally {
              setBusy(false);
            }
          }}
        >
          Excluir paciente
        </Button>
      }
    >
      <Flex direction="column" gap="1.25rem">
        <Card variation="outlined">
          <Heading level={4}>Editar paciente</Heading>
          <PatientForm
            initialValues={{
              ...patient,
              birthDate: patient.birthDate ?? undefined,
              document: patient.document ?? undefined,
              phone: patient.phone ?? undefined,
              email: patient.email ?? undefined,
              notes: patient.notes ?? undefined,
            }}
            submitLabel="Salvar alterações"
            busy={busy}
            onSubmit={async (values) => {
              setBusy(true);
              try {
                await updatePatient({ id: patient.id, ...values });
              } finally {
                setBusy(false);
              }
            }}
          />
        </Card>

        <Card variation="outlined">
          <Heading level={4}>Resumo</Heading>
          <Text className="muted">Documento: {patient.document ?? 'Não informado'}</Text>
          <Text className="muted">Telefone: {patient.phone ?? 'Não informado'}</Text>
          <Text className="muted">E-mail: {patient.email ?? 'Não informado'}</Text>
          <Text className="muted">Nascimento: {formatDate(patient.birthDate)}</Text>
          <Text className="muted">Criado em: {formatDate(patient.createdAt)}</Text>
        </Card>

        <Card variation="outlined">
          <Flex justifyContent="space-between" alignItems="center" wrap="wrap">
            <Heading level={4}>Casos do paciente</Heading>
            <Button as={Link} to="/cases/new">
              Novo caso
            </Button>
          </Flex>

          {patientCases.length === 0 ? (
            <EmptyState
              title="Nenhum caso cadastrado"
              description="Crie o primeiro caso para este paciente."
              actionLabel="Novo caso"
              actionTo="/cases/new"
            />
          ) : (
            <Table highlightOnHover>
              <TableHead>
                <TableRow>
                  <TableCell as="th">Caso</TableCell>
                  <TableCell as="th">Título</TableCell>
                  <TableCell as="th">Status</TableCell>
                  <TableCell as="th">Prazo</TableCell>
                  <TableCell as="th">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patientCases.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.caseNumber}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{formatDate(item.dueDate)}</TableCell>
                    <TableCell>
                      <Button as={Link} to={`/cases/${item.id}`} size="small" variation="link">
                        Abrir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </Flex>
    </PageShell>
  );
}
