import { Button, Card, Flex, Grid, Heading, SelectField, Text } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageShell } from '../components/ui/PageShell';
import { PriorityBadge, StatusBadge } from '../components/ui/StatusBadge';
import { useWorkspaceSnapshot } from '../hooks/useWorkspaceSnapshot';
import { CASE_STATUSES as workflowStatuses } from '../lib/domain';
import { formatDate } from '../lib/format';

export function DashboardPage() {
  const { patients, cases, history, files, loading, error, refresh } = useWorkspaceSnapshot();
  const [status, setStatus] = useState<string>('');

  const filteredCases = useMemo(() => {
    return status ? cases.filter((entry) => entry.status === status) : cases;
  }, [cases, status]);

  const openCases = cases.filter((entry) => entry.status !== 'delivered').length;
  const deliveredCases = cases.filter((entry) => entry.status === 'delivered').length;
  const urgentCases = cases.filter((entry) => entry.priority === 'urgent').length;

  const dueSoon = [...cases]
    .filter((entry) => Boolean(entry.dueDate))
    .sort((left, right) => {
      const leftDate = left.dueDate ? new Date(left.dueDate).getTime() : 0;
      const rightDate = right.dueDate ? new Date(right.dueDate).getTime() : 0;
      return leftDate - rightDate;
    })
    .slice(0, 5);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <PageShell title="Dashboard" description="Visão geral da produção">
        <EmptyState
          title="Não foi possível carregar o painel"
          description={error}
          actionLabel="Tentar novamente"
          actionTo="/dashboard"
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Dashboard"
      description="Resumo operacional da clínica e da produção."
      actions={
        <Button as={Link} to="/cases/new">
          Novo caso
        </Button>
      }
    >
      <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap="1rem" marginBottom="1rem">
        <Card variation="outlined">
          <Text className="muted">Pacientes</Text>
          <Heading level={3}>{patients.length}</Heading>
        </Card>
        <Card variation="outlined">
          <Text className="muted">Casos em aberto</Text>
          <Heading level={3}>{openCases}</Heading>
        </Card>
        <Card variation="outlined">
          <Text className="muted">Casos entregues</Text>
          <Heading level={3}>{deliveredCases}</Heading>
        </Card>
        <Card variation="outlined">
          <Text className="muted">Prioridade urgente</Text>
          <Heading level={3}>{urgentCases}</Heading>
        </Card>
      </Grid>

      <Grid templateColumns={{ base: '1fr', large: '2fr 1fr' }} gap="1rem">
        <Card variation="outlined" className="surface">
          <Flex justifyContent="space-between" alignItems="center" gap="1rem" wrap="wrap">
            <Heading level={4}>Casos recentes</Heading>
            <SelectField
              label="Filtrar por status"
              labelHidden
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Todos</option>
              {workflowStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
          </Flex>

          <Flex direction="column" gap="0.75rem" marginTop="1rem">
            {filteredCases.length === 0 ? (
              <EmptyState
                title="Nenhum caso encontrado"
                description="Crie o primeiro caso ou remova o filtro atual."
                actionLabel="Novo caso"
                actionTo="/cases/new"
              />
            ) : (
              filteredCases.slice(0, 8).map((item) => (
                <Card key={item.id} variation="outlined">
                  <Flex justifyContent="space-between" wrap="wrap" gap="0.75rem">
                    <div>
                      <Heading level={5}>{item.title}</Heading>
                      <Text className="muted">
                        {item.caseNumber} • {formatDate(item.dueDate)}
                      </Text>
                    </div>
                    <Flex gap="0.5rem" wrap="wrap">
                      <StatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />
                    </Flex>
                  </Flex>
                </Card>
              ))
            )}
          </Flex>
        </Card>

        <Flex direction="column" gap="1rem">
          <Card variation="outlined">
            <Heading level={4}>Linha do tempo</Heading>
            <Text className="muted">Histórico recente de status e movimentações.</Text>
            <Flex direction="column" gap="0.75rem" marginTop="1rem">
              {history.slice(0, 5).map((entry) => (
                <Card key={entry.id} variation="outlined">
                  <Text fontWeight={700}>{entry.toStatus}</Text>
                  <Text className="muted">
                    {entry.fromStatus ? `${entry.fromStatus} → ` : ''}
                    {formatDate(entry.createdAt)}
                  </Text>
                </Card>
              ))}
            </Flex>
          </Card>

          <Card variation="outlined">
            <Heading level={4}>Arquivos</Heading>
            <Text className="muted">{files.length} anexos registrados no sistema.</Text>
          </Card>

          <Card variation="outlined">
            <Heading level={4}>Próximos vencimentos</Heading>
            <Flex direction="column" gap="0.75rem" marginTop="1rem">
              {dueSoon.length === 0 ? (
                <Text className="muted">Sem datas de entrega registradas.</Text>
              ) : (
                dueSoon.map((item) => (
                  <Card key={item.id} variation="outlined">
                    <Text fontWeight={700}>{item.title}</Text>
                    <Text className="muted">{formatDate(item.dueDate)}</Text>
                  </Card>
                ))
              )}
            </Flex>
          </Card>
        </Flex>
      </Grid>

      <Flex gap="0.75rem" marginTop="1rem" wrap="wrap">
        <Button onClick={refresh} variation="link">
          Atualizar dados
        </Button>
        <Button as={Link} to="/patients/new" variation="link">
          Novo paciente
        </Button>
      </Flex>
    </PageShell>
  );
}
