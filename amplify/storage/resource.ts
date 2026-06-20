import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'fluxoAlinhadoresFiles',
  access: (allow) => ({
    'cases/{entity_id}/*': [allow.entity('identity').to(['read', 'write', 'delete'])],
  }),
});
