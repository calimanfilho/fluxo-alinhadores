import { Button, Card, Flex, Heading, Text, Table, TableBody, TableCell, TableHead, TableRow } from '@aws-amplify/ui-react';
import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageShell } from '../components/ui/PageShell';
import { useEntityLoader } from '../hooks/useEntityLoader';
import { useWorkspaceSnapshot } from '../hooks/useWorkspaceSnapshot';
import { describeFileSize, loadFilesForCase, openCaseFile, removeCaseAttachment, uploadFilesForCase } from '../services/storageService';
import { getCase } from '../services/fluxoApi';
import { formatDateTime } from '../lib/format';

export function CaseFilesPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
    data: filesData,
    loading: filesLoading,
    error: filesError,
  } = useEntityLoader(
    async () => {
      if (!caseId) {
        throw new Error('Caso não informado.');
      }

      return loadFilesForCase(caseId);
    },
    [caseId, busy],
  );
  const files = filesData ?? [];

  const patient = useMemo(() => {
    if (!alignerCase) {
      return null;
    }

    return patients.find((item) => item.id === alignerCase.patientId) ?? null;
  }, [alignerCase, patients]);

  if (caseLoading || filesLoading) {
    return <LoadingState />;
  }

  if (caseError || filesError || !alignerCase) {
    return (
      <PageShell title="Uploads do caso" description="Arquivos clínicos e produção">
        <EmptyState
          title="Não foi possível carregar os anexos"
          description={caseError ?? filesError ?? 'O caso solicitado não está disponível.'}
          actionLabel="Voltar"
          actionTo="/cases"
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Uploads - ${alignerCase.caseNumber}`}
      description={patient ? `Paciente: ${patient.name}` : 'Arquivos vinculados ao caso.'}
      actions={<Button as={Link} to={`/cases/${alignerCase.id}`}>Voltar</Button>}
    >
      <Flex direction="column" gap="1rem">
        <Card variation="outlined">
          <Heading level={4}>Enviar arquivos</Heading>
          <Text className="muted">
            Envie STL, imagens, PDFs e documentos clínicos. Os arquivos ficam privados por usuário e caso.
          </Text>
          <input
            type="file"
            multiple
            accept=".stl,.pdf,.doc,.docx,.txt,.zip,image/*,application/pdf"
            onChange={async (event) => {
              const selected = Array.from(event.target.files ?? []);
              if (selected.length === 0) {
                return;
              }

              setBusy(true);
              setUploadError(null);
              try {
                await uploadFilesForCase(alignerCase.id, selected);
              } catch (cause) {
                setUploadError(cause instanceof Error ? cause.message : 'Falha no upload.');
              } finally {
                setBusy(false);
                event.target.value = '';
              }
            }}
          />
          {busy ? <Text className="muted">Processando upload...</Text> : null}
          {uploadError ? <Text className="error-text">{uploadError}</Text> : null}
        </Card>

        {files.length === 0 ? (
          <EmptyState
            title="Nenhum arquivo enviado"
            description="Faça upload dos anexos deste caso para começar."
          />
        ) : (
          <Table highlightOnHover>
            <TableHead>
              <TableRow>
                <TableCell as="th">Arquivo</TableCell>
                <TableCell as="th">Tipo</TableCell>
                <TableCell as="th">Tamanho</TableCell>
                <TableCell as="th">Criado em</TableCell>
                <TableCell as="th">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{file.fileName}</TableCell>
                  <TableCell>{file.contentType ?? '—'}</TableCell>
                  <TableCell>{describeFileSize(file.size)}</TableCell>
                  <TableCell>{formatDateTime(file.createdAt)}</TableCell>
                  <TableCell>
                    <Flex gap="0.5rem">
                      <Button
                        size="small"
                        variation="link"
                        onClick={async () => {
                          const url = await openCaseFile(file.fileKey);
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        Abrir
                      </Button>
                      <Button
                        size="small"
                        variation="link"
                        className="danger-link"
                        onClick={async () => {
                          setBusy(true);
                          try {
                            await removeCaseAttachment(file.id);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        Remover
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Flex>
    </PageShell>
  );
}
