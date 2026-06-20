import { Button, Card, Flex, Text } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({ title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <Card variation="outlined" className="empty-state">
      <Flex direction="column" gap="0.5rem" alignItems="center" textAlign="center">
        <Text as="strong">{title}</Text>
        <Text className="muted">{description}</Text>
        {actionLabel && actionTo ? (
          <Button as={Link} to={actionTo} variation="primary">
            {actionLabel}
          </Button>
        ) : null}
      </Flex>
    </Card>
  );
}
