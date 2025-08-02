import { defineAuth, secret } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      // These URLs must match what you configured in the Cognito Hosted UI
      callbackUrls: [
        'http://localhost:5173/',
        // Add your deployed app's URL here in the future
      ],
      logoutUrls: [
        'http://localhost:5173/auth/',
        // Add your deployed app's URL here in the future
      ],
      google: {
        // Use secrets for your client ID and secret
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'profile', 'openid'],
      },
    },
  },
  userAttributes: {
    email: {
      required: true,
    },
    // Use standard OIDC attributes that map to Google's response
    givenName: {
      required: false,
    },
    familyName: {
      required: false,
    },
    profilePicture: {
        required: false,
    }
  },
});
