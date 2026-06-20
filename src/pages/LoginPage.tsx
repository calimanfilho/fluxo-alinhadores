import { Card, Heading, Text } from '@aws-amplify/ui-react';
import { Authenticator } from '@aws-amplify/ui-react';

export function LoginPage() {
  return (
    <div className="login-page">
      <section className="login-page__hero">
        <Text className="brand__eyebrow">Fluxo Alinhadores</Text>
        <Heading level={1}>Gestão completa da produção de alinhadores.</Heading>
        <Text className="muted">
          Controle pacientes, casos, arquivos clínicos, histórico de status e entrega em um fluxo
          protegido por usuário.
        </Text>
      </section>

      <Card className="login-page__card">
        <Authenticator loginMechanisms={['email']} />
      </Card>
    </div>
  );
}
