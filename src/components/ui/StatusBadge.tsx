import { Badge } from '@aws-amplify/ui-react';
import type { CaseStatus, PriorityLevel } from '../../lib/domain';

const statusLabels: Record<CaseStatus, string> = {
  received: 'Recebido',
  planned: 'Planejado',
  approved: 'Aprovado',
  printed: 'Impresso',
  thermoformed: 'Termoformado',
  trimmed: 'Recortado',
  polished: 'Polido',
  quality: 'Qualidade',
  delivered: 'Entregue',
};

const priorityLabels: Record<PriorityLevel, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  const tone =
    status === 'delivered' || status === 'quality'
      ? 'success'
      : status === 'printed' || status === 'thermoformed'
        ? 'warning'
        : status === 'planned' || status === 'approved'
          ? 'info'
          : 'neutral';

  return (
    <Badge variation={tone === 'neutral' ? undefined : (tone as 'info' | 'error' | 'warning' | 'success')} className={`status-badge status-badge--${tone}`}>
      {statusLabels[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority?: PriorityLevel | null }) {
  if (!priority) {
    return <Badge>Sem prioridade</Badge>;
  }

  const tone =
    priority === 'urgent'
      ? 'danger'
      : priority === 'high'
        ? 'warning'
        : priority === 'low'
          ? 'info'
          : 'neutral';

  return (
    <Badge variation={tone === 'neutral' ? undefined : (tone as 'info' | 'error' | 'warning' | 'success')} className={`status-badge status-badge--${tone}`}>
      {priorityLabels[priority]}
    </Badge>
  );
}
