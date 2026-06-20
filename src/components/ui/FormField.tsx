import { Flex, Text } from '@aws-amplify/ui-react';
import type { PropsWithChildren } from 'react';

interface FormFieldProps extends PropsWithChildren {
  label: string;
  error?: string;
  hint?: string;
}

export function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <Flex direction="column" gap="0.35rem">
      <Text as="label" fontWeight={600}>
        {label}
      </Text>
      {children}
      {hint ? <Text className="muted">{hint}</Text> : null}
      {error ? <Text className="error-text">{error}</Text> : null}
    </Flex>
  );
}
