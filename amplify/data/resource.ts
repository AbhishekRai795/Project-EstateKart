import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  User: a
    .model({
      id: a.string().required(),
      owner: a.string(),
      username: a.string(),
      name: a.string(),
      email: a.string(),
      phone: a.string(),
      location: a.string(),
      bio: a.string(),
      avatarUrl: a.string(),
      properties: a.hasMany('Property', 'ownerId'),
      viewings: a.hasMany('PropertyViewing', 'userId'),
      preferences: a.hasMany('UserPreference', 'userId'),
      sentQueries: a.hasMany('ClientQuery', 'userId'),
      receivedQueries: a.hasMany('ClientQuery', 'propertyOwnerId'),
    })
    .identifier(['id'])
    // --- FIX: Refactored authorization rules to prevent conflicts ---
    .authorization((allow) => [
      // Any authenticated user can create a profile and read any profile.
      allow.authenticated().to(['create', 'read']),
      // Only the owner of a profile can update or delete it.
      allow.ownerDefinedIn('id').to(['update', 'delete']),
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
      queries: a.hasMany('ClientQuery', 'propertyId'),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('ownerId').to(['create', 'read', 'update', 'delete']),
      allow.guest().to(['read']),
      allow.authenticated().to(['read']),
    ]),

  ClientQuery: a
    .model({
      propertyId: a.id().required(),
      property: a.belongsTo('Property', 'propertyId'),
      userId: a.id().required(),
      user: a.belongsTo('User', 'userId'),
      propertyOwnerId: a.id().required(),
      propertyOwner: a.belongsTo('User', 'propertyOwnerId'),
      clientName: a.string().required(),
      clientEmail: a.string().required(),
      clientPhone: a.string(),
      subject: a.string().required(),
      message: a.string().required(),
      status: a.enum(['unread', 'read', 'replied']),
      priority: a.enum(['low', 'medium', 'high']),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.ownerDefinedIn('userId').to(['create', 'read', 'update', 'delete']),
      allow.ownerDefinedIn('propertyOwnerId').to(['read', 'update']),
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
      status: a.enum(['scheduled', 'completed', 'cancelled', 'accepted', 'rejected']),
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
