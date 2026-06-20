import { Button, Card, Heading, Text } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Card className="not-found">
      <Heading level={2}>Página não encontrada</Heading>
      <Text className="muted">O endereço solicitado não existe nesta aplicação.</Text>
      <Button as={Link} to="/dashboard">
        Ir para o dashboard
      </Button>
    </Card>
  );
}
