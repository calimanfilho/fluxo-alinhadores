import { Flex, Loader, Text } from '@aws-amplify/ui-react';

export function LoadingState({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <Flex direction="column" gap="0.75rem" alignItems="center" className="state-block">
      <Loader size="large" />
      <Text className="muted">{label}</Text>
    </Flex>
  );
}
