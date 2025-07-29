import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Property: a
    .model({
      id: a.id().required(),
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
      listerId: a.string().required(),
      listerName: a.string(),
      listerEmail: a.string(),
      listerPhone: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      // Back to proper Cognito-based authorization
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
      allow.owner().to(['create', 'update', 'delete']),
    ])
    .secondaryIndexes((index) => [
      index('listerId').queryField('listPropertiesByLister'),
      index('status').queryField('listPropertiesByStatus'),
      index('type').queryField('listPropertiesByType'),
      index('createdAt').queryField('listPropertiesByDate'),
    ]),

  UserPreference: a
    .model({
      id: a.id().required(),
      userId: a.string().required(),
      catalogueProperties: a.string().array(),
      favoriteProperties: a.string().array(),
      searchHistory: a.string().array(),
      priceRange: a.json(),
      preferredLocations: a.string().array(),
    })
    .authorization((allow) => [
      allow.owner().to(['create', 'read', 'update', 'delete']),
    ]),

  PropertyViewing: a
    .model({
      id: a.id().required(),
      propertyId: a.string().required(),
      clientName: a.string().required(),
      clientEmail: a.string().required(),
      clientPhone: a.string(),
      date: a.date().required(),
      time: a.string().required(),
      message: a.string(),
      status: a.enum(['scheduled', 'completed', 'cancelled']),
      listerId: a.string().required(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner().to(['read', 'update']),
      allow.authenticated().to(['create']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // Back to proper Cognito auth
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
