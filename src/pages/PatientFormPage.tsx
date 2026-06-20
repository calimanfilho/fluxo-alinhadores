import { useNavigate } from 'react-router-dom';
import { PatientForm } from '../components/forms/PatientForm';
import { PageShell } from '../components/ui/PageShell';
import { createPatient } from '../services/fluxoApi';

export function PatientFormPage() {
  const navigate = useNavigate();

  return (
    <PageShell title="Novo paciente" description="Cadastro de um novo paciente">
      <PatientForm
        submitLabel="Salvar paciente"
        onSubmit={async (values) => {
          const patient = await createPatient(values);
          navigate(`/patients/${patient.id}`);
        }}
      />
    </PageShell>
  );
}
