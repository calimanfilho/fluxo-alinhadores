import { Button, Flex, SelectField, TextAreaField, TextField } from '@aws-amplify/ui-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { AlignerCaseRecord, CaseInput, CaseStatus, PatientRecord } from '../../lib/domain';
import { normalizeOptional, toInputDate } from '../../lib/format';
import { validateCase, type FieldErrors } from '../../lib/validation';
import { FormField } from '../ui/FormField';
import { CASE_STATUSES, ARCH_OPTIONS, PRIORITY_LEVELS } from '../../lib/domain';

interface CaseFormProps {
  patients: PatientRecord[];
  initialValues?: Partial<AlignerCaseRecord>;
  onSubmit: (values: CaseInput) => Promise<void>;
  submitLabel: string;
  busy?: boolean;
}

const emptyValues: CaseInput = {
  patientId: '',
  caseNumber: '',
  title: '',
  status: 'received',
  upperArch: 'pending',
  lowerArch: 'pending',
  quantityOfAligners: undefined,
  priority: 'normal',
  dueDate: '',
  notes: '',
};

export function CaseForm({ patients, initialValues, onSubmit, submitLabel, busy }: CaseFormProps) {
  const [values, setValues] = useState<CaseInput>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors>({});

  const patientOptions = useMemo(
    () =>
      [...patients].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR')),
    [patients],
  );

  useEffect(() => {
    setValues({
      patientId: initialValues?.patientId ?? '',
      caseNumber: initialValues?.caseNumber ?? '',
      title: initialValues?.title ?? '',
      status: (initialValues?.status ?? 'received') as CaseStatus,
      upperArch: initialValues?.upperArch ?? 'pending',
      lowerArch: initialValues?.lowerArch ?? 'pending',
      quantityOfAligners: initialValues?.quantityOfAligners ?? undefined,
      priority: initialValues?.priority ?? 'normal',
      dueDate: toInputDate(initialValues?.dueDate ?? ''),
      notes: initialValues?.notes ?? '',
    });
  }, [initialValues]);

  function updateField<K extends keyof CaseInput>(key: K, value: CaseInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateCase(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      ...values,
      caseNumber: values.caseNumber.trim(),
      title: values.title.trim(),
      dueDate: normalizeOptional(values.dueDate ?? ''),
      notes: normalizeOptional(values.notes ?? ''),
      quantityOfAligners: values.quantityOfAligners ? Number(values.quantityOfAligners) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="1rem">
        <FormField label="Paciente" error={errors.patientId}>
          <SelectField
            label="Paciente"
            labelHidden
            value={values.patientId}
            onChange={(event) => updateField('patientId', event.target.value)}
          >
            <option value="">Selecione</option>
            {patientOptions.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </SelectField>
        </FormField>

        <FormField label="Número do caso" error={errors.caseNumber}>
          <TextField
            label="Número do caso"
            labelHidden
            value={values.caseNumber}
            onChange={(event) => updateField('caseNumber', event.target.value)}
            placeholder="A-2026-001"
          />
        </FormField>

        <FormField label="Título" error={errors.title}>
          <TextField
            label="Título"
            labelHidden
            value={values.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Caso superior e inferior"
          />
        </FormField>

        <Flex gap="1rem" wrap="wrap">
          <FormField label="Status" error={errors.status}>
            <SelectField
              label="Status"
              labelHidden
              value={values.status}
              onChange={(event) => updateField('status', event.target.value as CaseStatus)}
            >
              {CASE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
          </FormField>

          <FormField label="Prioridade" error={errors.priority}>
            <SelectField
              label="Prioridade"
              labelHidden
              value={values.priority ?? 'normal'}
              onChange={(event) => updateField('priority', event.target.value as (typeof PRIORITY_LEVELS)[number])}
            >
              {PRIORITY_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
          </FormField>
        </Flex>

        <Flex gap="1rem" wrap="wrap">
          <FormField label="Arco superior" error={errors.upperArch}>
            <SelectField
              label="Arco superior"
              labelHidden
              value={values.upperArch ?? 'pending'}
              onChange={(event) => updateField('upperArch', event.target.value as CaseInput['upperArch'])}
            >
              {ARCH_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
          </FormField>

          <FormField label="Arco inferior" error={errors.lowerArch}>
            <SelectField
              label="Arco inferior"
              labelHidden
              value={values.lowerArch ?? 'pending'}
              onChange={(event) => updateField('lowerArch', event.target.value as CaseInput['lowerArch'])}
            >
              {ARCH_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </SelectField>
          </FormField>
        </Flex>

        <FormField label="Quantidade de alinhadores" error={errors.quantityOfAligners}>
          <TextField
            label="Quantidade de alinhadores"
            labelHidden
            type="number"
            min="0"
            value={values.quantityOfAligners ?? ''}
            onChange={(event) =>
              updateField('quantityOfAligners', event.target.value ? Number(event.target.value) : undefined)
            }
            placeholder="Ex.: 20"
          />
        </FormField>

        <FormField label="Data prevista" error={errors.dueDate}>
          <TextField
            label="Data prevista"
            labelHidden
            type="date"
            value={values.dueDate ?? ''}
            onChange={(event) => updateField('dueDate', event.target.value)}
          />
        </FormField>

        <FormField label="Observações">
          <TextAreaField
            label="Observações"
            labelHidden
            value={values.notes ?? ''}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Anotações clínicas e operacionais"
          />
        </FormField>

        <Button type="submit" variation="primary" isLoading={busy}>
          {submitLabel}
        </Button>
      </Flex>
    </form>
  );
}
