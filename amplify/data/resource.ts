import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

// This is the final, correct schema to deploy to your new, clean sandbox.
const schema = a.schema({
  User: a
    .model({
      username: a.string(),
      properties: a.hasMany('Property', 'ownerId'),
      viewings: a.hasMany('PropertyViewing', 'userId'),
      preferences: a.hasMany('UserPreference', 'userId'),
    })
    .authorization((allow) => [
      allow.owner().to(['read', 'update', 'delete']),
    ]),

  Property: a
    .model({
      ownerId: a.id().required(),
      owner: a.belongsTo('User', 'ownerId'),
      title: a.string().required(),
      description: a.string().required(),
      price: a.integer().required(),
      location: a.string().required(),
      type: a.enum(['house', 'apartment', 'condo', 'villa']),
      bedrooms: a.integer().required(),
      bathrooms: a.integer().required(),
      area: a.integer().required(),
      status: a.enum(['available', 'pending', 'sold']),
      images: a.string().array(),
      features: a.string().array(),
      views: a.integer(),
      listerName: a.string(),
      listerEmail: a.string(),
      listerPhone: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      viewings: a.hasMany('PropertyViewing', 'propertyId'),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('ownerId').to(['create', 'read', 'update', 'delete']),
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
    ]),

  UserPreference: a
    .model({
      userId: a.id().required(),
      user: a.belongsTo('User', 'userId'),
      catalogueProperties: a.string().array(),
      favoriteProperties: a.string().array(),
      searchHistory: a.string().array(),
      priceRange: a.json(),
      preferredLocations: a.string().array(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
    ]),

  PropertyViewing: a
    .model({
      propertyId: a.id().required(),
      property: a.belongsTo('Property', 'propertyId'),
      userId: a.id().required(),
      user: a.belongsTo('User', 'userId'),
      propertyOwnerId: a.id().required(),
      message: a.string(),
      scheduledAt: a.datetime().required(), 
      status: a.enum(['scheduled', 'completed', 'cancelled']),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
      allow.ownerDefinedIn('propertyOwnerId').to(['read', 'update']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
