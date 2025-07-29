import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'propertyImages',
  access: (allow) => ({
    'public/properties/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});
