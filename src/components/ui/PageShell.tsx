import type { PropsWithChildren, ReactNode } from 'react';
import { Card, Flex, Heading, Text } from '@aws-amplify/ui-react';

interface PageShellProps extends PropsWithChildren {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageShell({ title, description, actions, children }: PageShellProps) {
  return (
    <Flex direction="column" gap="1rem">
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        wrap="wrap"
        gap="1rem"
        className="page-shell__header"
      >
        <div>
          <Heading level={2}>{title}</Heading>
          {description ? <Text className="muted">{description}</Text> : null}
        </div>
        {actions ? <Flex gap="0.75rem">{actions}</Flex> : null}
      </Flex>
      <Card className="surface">{children}</Card>
    </Flex>
  );
}
