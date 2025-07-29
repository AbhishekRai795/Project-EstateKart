import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
    },
    phoneNumber: {
      required: false,
    },
    givenName: {
      required: false,
    },
    familyName: {
      required: false,
    },
  },
});
