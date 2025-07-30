// import { getCurrentUser } from 'aws-amplify/auth';
// import { generateClient } from 'aws-amplify/data';
// import type { Schema } from '../../amplify/data/resource';

// const client = generateClient<Schema>();

// export interface UserPreferenceData {
//   id?: string;
//   userId: string;
//   catalogueProperties: string[];
//   favoriteProperties: string[];
//   searchHistory: string[];
//   priceRange: {
//     min: number;
//     max: number;
//   };
//   preferredLocations: string[];
//   createdAt?: string;
//   updatedAt?: string;
// }

// export class UserPreferenceService {
//   /**
//    * Get or create user preferences for the current user.
//    * This is the primary method for fetching user-specific data.
//    */
//   static async getUserPreferences(): Promise<UserPreferenceData | null> {
//     try {
//       const user = await getCurrentUser();
//       const { data } = await client.models.UserPreference.list({
//         filter: { userId: { eq: user.userId } }
//       });

//       if (data.length > 0) {
//         const preference = data[0];
//         // Clean up any null values that might exist in arrays from older data
//         return {
//           id: preference.id,
//           userId: preference.userId,
//           catalogueProperties: (preference.catalogueProperties as string[])?.filter(Boolean) || [],
//           favoriteProperties: (preference.favoriteProperties as string[])?.filter(Boolean) || [],
//           searchHistory: (preference.searchHistory as string[])?.filter(Boolean) || [],
//           priceRange: preference.priceRange as { min: number; max: number } || { min: 0, max: 10000000 },
//           preferredLocations: (preference.preferredLocations as string[])?.filter(Boolean) || [],
//           createdAt: preference.createdAt || undefined,
//           updatedAt: preference.updatedAt || undefined,
//         };
//       }

//       // If no preferences exist for the user, create a default set.
//       return await UserPreferenceService.createDefaultPreferences(user.userId);
//     } catch (error) {
//       // This error is expected when no user is logged in.
//       // We return null as there are no preferences for a guest user.
//       if (error instanceof Error && error.name === 'UserUnAuthenticatedException') {
//         return null;
//       }
//       // Log other unexpected errors
//       console.error('Error fetching user preferences:', error);
//       return null;
//     }
//   }

//   /**
//    * Create default user preferences for a new user.
//    */
//   static async createDefaultPreferences(userId: string): Promise<UserPreferenceData | null> {
//     try {
//       const { data } = await client.models.UserPreference.create({
//         userId,
//         catalogueProperties: [],
//         favoriteProperties: [],
//         searchHistory: [],
//         priceRange: { min: 0, max: 10000000 },
//         preferredLocations: []
//       });

//       if (data) {
//         return {
//           id: data.id,
//           userId: data.userId,
//           catalogueProperties: [],
//           favoriteProperties: [],
//           searchHistory: [],
//           priceRange: { min: 0, max: 10000000 },
//           preferredLocations: [],
//           createdAt: data.createdAt || undefined,
//           updatedAt: data.updatedAt || undefined,
//         };
//       }

//       return null;
//     } catch (error) {
//       console.error('Error creating default preferences:', error);
//       return null;
//     }
//   }

//   /**
//    * Update existing user preferences.
//    */
//   static async updatePreferences(
//     preferenceId: string,
//     updates: Partial<Omit<UserPreferenceData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
//   ): Promise<UserPreferenceData | null> {
//     try {
//       const { data } = await client.models.UserPreference.update({
//         id: preferenceId,
//         ...updates
//       });

//       if (data) {
//         return {
//           id: data.id,
//           userId: data.userId,
//           catalogueProperties: (data.catalogueProperties as string[])?.filter(Boolean) || [],
//           favoriteProperties: (data.favoriteProperties as string[])?.filter(Boolean) || [],
//           searchHistory: (data.searchHistory as string[])?.filter(Boolean) || [],
//           priceRange: data.priceRange as { min: number; max: number } || { min: 0, max: 10000000 },
//           preferredLocations: (data.preferredLocations as string[])?.filter(Boolean) || [],
//           createdAt: data.createdAt || undefined,
//           updatedAt: data.updatedAt || undefined,
//         };
//       }

//       return null;
//     } catch (error) {
//       console.error('Error updating preferences:', error);
//       return null;
//     }
//   }

//   /**
//    * Toggle a property in the catalogue (add if not present, remove if present).
//    */
//   static async toggleCatalogue(propertyId: string): Promise<UserPreferenceData | null> {
//     try {
//       const preferences = await UserPreferenceService.getUserPreferences();
//       if (!preferences || !preferences.id) {
//         // This can happen if the user is not logged in.
//         console.warn('Cannot toggle catalogue for an unauthenticated user.');
//         return null;
//       }

//       const currentCatalogue = preferences.catalogueProperties || [];
//       const newCatalogue = currentCatalogue.includes(propertyId)
//         ? currentCatalogue.filter(id => id !== propertyId) // Remove
//         : [...currentCatalogue, propertyId]; // Add
        
//       return await UserPreferenceService.updatePreferences(preferences.id, {
//         catalogueProperties: newCatalogue
//       });
//     } catch (error) {
//       console.error('Error toggling catalogue:', error);
//       return null;
//     }
//   }

//   /**
//    * Toggle a property in favorites (add if not present, remove if present).
//    */
//   static async toggleFavorite(propertyId: string): Promise<UserPreferenceData | null> {
//     try {
//       const preferences = await UserPreferenceService.getUserPreferences();
//       if (!preferences || !preferences.id) {
//         // This can happen if the user is not logged in.
//         console.warn('Cannot toggle favorite for an unauthenticated user.');
//         return null;
//       }

//       const currentFavorites = preferences.favoriteProperties || [];
//       const newFavorites = currentFavorites.includes(propertyId)
//         ? currentFavorites.filter(id => id !== propertyId) // Remove
//         : [...currentFavorites, propertyId]; // Add
      
//       return await UserPreferenceService.updatePreferences(preferences.id, {
//         favoriteProperties: newFavorites
//       });
//     } catch (error) {
//       console.error('Error toggling favorite:', error);
//       return null;
//     }
//   }
// }

// export default UserPreferenceService;