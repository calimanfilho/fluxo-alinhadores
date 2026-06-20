import { Button, Card, Flex, Heading, SelectField, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageShell } from '../components/ui/PageShell';
import { PriorityBadge, StatusBadge } from '../components/ui/StatusBadge';
import { useWorkspaceSnapshot } from '../hooks/useWorkspaceSnapshot';
import { CASE_STATUSES, type CaseStatus } from '../lib/domain';
import { formatDate, lowerCaseIncludes } from '../lib/format';

export function CasesPage() {
  const { patients, cases, loading, error, refresh } = useWorkspaceSnapshot();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<CaseStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const patientById = useMemo(() => new Map(patients.map((patient) => [patient.id, patient])), [patients]);

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const patient = patientById.get(item.patientId);
      const searchMatch =
        !query.trim() ||
        [item.caseNumber, item.title, patient?.name ?? ''].some((field) => lowerCaseIncludes(field, query));

      const statusMatch = !status || item.status === status;
      const fromMatch = !fromDate || !item.dueDate || item.dueDate >= fromDate;
      const toMatch = !toDate || !item.dueDate || item.dueDate <= toDate;

      return searchMatch && statusMatch && fromMatch && toMatch;
    });
  }, [cases, patientById, query, status, fromDate, toDate]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <PageShell title="Casos" description="Gestão dos alinhadores">
        <EmptyState
          title="Falha ao carregar casos"
          description={error}
          actionLabel="Recarregar"
          actionTo="/cases"
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Casos"
      description="Consulta, filtros e acompanhamento do fluxo de produção."
      actions={
        <Button as={Link} to="/cases/new">
          Novo caso
        </Button>
      }
    >
      <Flex direction="column" gap="1rem">
        <Card variation="outlined">
          <Heading level={4}>Filtros</Heading>
          <Flex gap="1rem" wrap="wrap" marginTop="1rem">
            <TextField
              label="Busca"
              placeholder="Caso, título ou paciente"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <SelectField
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as CaseStatus | '')}
            >
              <option value="">Todos</option>
              {CASE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
            <TextField
              type="date"
              label="De"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <TextField
              type="date"
              label="Até"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </Flex>
        </Card>

        {filteredCases.length === 0 ? (
          <EmptyState
            title="Nenhum caso encontrado"
            description="Crie um novo caso ou revise os filtros aplicados."
            actionLabel="Novo caso"
            actionTo="/cases/new"
          />
        ) : (
          <Table highlightOnHover>
            <TableHead>
              <TableRow>
                <TableCell as="th">Caso</TableCell>
                <TableCell as="th">Paciente</TableCell>
                <TableCell as="th">Status</TableCell>
                <TableCell as="th">Prioridade</TableCell>
                <TableCell as="th">Prazo</TableCell>
                <TableCell as="th">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCases.map((item) => {
                const patient = patientById.get(item.patientId);

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.caseNumber}</TableCell>
                    <TableCell>{patient?.name ?? 'Paciente indisponível'}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={item.priority} />
                    </TableCell>
                    <TableCell>{formatDate(item.dueDate)}</TableCell>
                    <TableCell>
                      <Button as={Link} to={`/cases/${item.id}`} size="small" variation="link">
                        Abrir
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <Flex justifyContent="flex-end">
          <Button onClick={refresh} variation="link">
            Atualizar
          </Button>
        </Flex>
      </Flex>
    </PageShell>
  );
}
