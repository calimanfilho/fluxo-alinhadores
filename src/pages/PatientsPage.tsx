import { Button, Card, Flex, Heading, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageShell } from '../components/ui/PageShell';
import { useWorkspaceSnapshot } from '../hooks/useWorkspaceSnapshot';
import { formatDate, lowerCaseIncludes } from '../lib/format';

export function PatientsPage() {
  const { patients, loading, error, refresh } = useWorkspaceSnapshot();
  const [query, setQuery] = useState('');

  const filteredPatients = useMemo(() => {
    if (!query.trim()) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.name, patient.document ?? '', patient.phone ?? '', patient.email ?? ''].some((field) =>
        lowerCaseIncludes(field, query),
      ),
    );
  }, [patients, query]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <PageShell title="Pacientes" description="Cadastro e consulta de pacientes">
        <EmptyState
          title="Falha ao carregar pacientes"
          description={error}
          actionLabel="Recarregar"
          actionTo="/patients"
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Pacientes"
      description="Cadastro e consulta dos pacientes da clínica."
      actions={
        <Button as={Link} to="/patients/new">
          Novo paciente
        </Button>
      }
    >
      <Flex direction="column" gap="1rem">
        <Card variation="outlined">
          <Flex justifyContent="space-between" gap="1rem" wrap="wrap">
            <Heading level={4}>Lista de pacientes</Heading>
            <TextField
              label="Busca"
              placeholder="Pesquisar por nome, documento, telefone ou e-mail"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </Flex>
        </Card>

        {filteredPatients.length === 0 ? (
          <EmptyState
            title="Nenhum paciente encontrado"
            description="Ajuste a busca ou cadastre um novo paciente."
            actionLabel="Novo paciente"
            actionTo="/patients/new"
          />
        ) : (
          <Table highlightOnHover>
            <TableHead>
              <TableRow>
                <TableCell as="th">Nome</TableCell>
                <TableCell as="th">Documento</TableCell>
                <TableCell as="th">Contato</TableCell>
                <TableCell as="th">Criado em</TableCell>
                <TableCell as="th">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.document ?? '—'}</TableCell>
                  <TableCell>{patient.phone ?? patient.email ?? '—'}</TableCell>
                  <TableCell>{formatDate(patient.createdAt)}</TableCell>
                  <TableCell>
                    <Button as={Link} to={`/patients/${patient.id}`} size="small" variation="link">
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
