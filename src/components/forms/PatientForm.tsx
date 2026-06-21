import { Button, Flex, TextAreaField, TextField } from '@aws-amplify/ui-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { PatientInput } from '../../lib/domain';
import { normalizeOptional, normalizePhoneNumber, toInputDate } from '../../lib/format';
import { validatePatient, type FieldErrors } from '../../lib/validation';
import { FormField } from '../ui/FormField';

interface PatientFormProps {
  initialValues?: Partial<PatientInput>;
  onSubmit: (values: PatientInput) => Promise<void>;
  submitLabel: string;
  busy?: boolean;
}

const emptyValues: PatientInput = {
  name: '',
  birthDate: '',
  document: '',
  phone: '',
  email: '',
  notes: '',
};

export function PatientForm({ initialValues, onSubmit, submitLabel, busy }: PatientFormProps) {
  const [values, setValues] = useState<PatientInput>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setValues({
      name: initialValues?.name ?? '',
      birthDate: toInputDate(initialValues?.birthDate ?? ''),
      document: initialValues?.document ?? '',
      phone: initialValues?.phone ?? '',
      email: initialValues?.email ?? '',
      notes: initialValues?.notes ?? '',
    });
  }, [initialValues]);

  function updateField<K extends keyof PatientInput>(key: K, value: PatientInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validatePatient(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      name: values.name.trim(),
      birthDate: normalizeOptional(values.birthDate ?? ''),
      document: normalizeOptional(values.document ?? ''),
      phone: normalizePhoneNumber(values.phone ?? ''),
      email: normalizeOptional(values.email ?? ''),
      notes: normalizeOptional(values.notes ?? ''),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="1rem">
        <FormField label="Nome" error={errors.name}>
          <TextField
            label="Nome"
            labelHidden
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Nome completo"
          />
        </FormField>

        <FormField label="Data de nascimento" error={errors.birthDate}>
          <TextField
            label="Data de nascimento"
            labelHidden
            type="date"
            value={values.birthDate ?? ''}
            onChange={(event) => updateField('birthDate', event.target.value)}
          />
        </FormField>

        <FormField label="Documento">
          <TextField
            label="Documento"
            labelHidden
            value={values.document ?? ''}
            onChange={(event) => updateField('document', event.target.value)}
            placeholder="CPF ou outro documento"
          />
        </FormField>

        <FormField label="Telefone" error={errors.phone}>
          <TextField
            label="Telefone"
            labelHidden
            type="tel"
            value={values.phone ?? ''}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="(00) 00000-0000 ou +5571996527148"
          />
        </FormField>

        <FormField label="E-mail" error={errors.email}>
          <TextField
            label="E-mail"
            labelHidden
            type="email"
            value={values.email ?? ''}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="contato@exemplo.com"
          />
        </FormField>

        <FormField label="Observações">
          <TextAreaField
            label="Observações"
            labelHidden
            value={values.notes ?? ''}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Informações clínicas relevantes"
          />
        </FormField>

        <Button type="submit" variation="primary" isLoading={busy}>
          {submitLabel}
        </Button>
      </Flex>
    </form>
  );
}
