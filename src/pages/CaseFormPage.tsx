import { useNavigate } from 'react-router-dom';
import { CaseForm } from '../components/forms/CaseForm';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageShell } from '../components/ui/PageShell';
import { useWorkspaceSnapshot } from '../hooks/useWorkspaceSnapshot';
import { createCase } from '../services/fluxoApi';

export function CaseFormPage() {
  const navigate = useNavigate();
  const { patients, loading, error } = useWorkspaceSnapshot();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <PageShell title="Novo caso" description="Cadastro de caso de alinhadores">
        <EmptyState
          title="Falha ao carregar pacientes"
          description={error}
          actionLabel="Tentar novamente"
          actionTo="/cases/new"
        />
      </PageShell>
    );
  }

  if (patients.length === 0) {
    return (
      <PageShell title="Novo caso" description="Cadastro de caso de alinhadores">
        <EmptyState
          title="Cadastre um paciente primeiro"
          description="É necessário ter ao menos um paciente para iniciar um caso."
          actionLabel="Novo paciente"
          actionTo="/patients/new"
        />
      </PageShell>
    );
  }

  return (
    <PageShell title="Novo caso" description="Cadastro de caso de alinhadores">
      <CaseForm
        patients={patients}
        submitLabel="Salvar caso"
        onSubmit={async (values) => {
          const newCase = await createCase(values);
          navigate(`/cases/${newCase.id}`);
        }}
      />
    </PageShell>
  );
}
