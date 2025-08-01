import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService, CreatePropertyInput, UpdatePropertyInput } from '../services/propertyService';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// --- CORE PROPERTY HOOKS ---

// FIXED: Fetches all properties for public display with proper error handling
export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyService.getAllProperties(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // FIXED: Added retry logic
    retryDelay: 1000,
  });
};

// Fetches a single property by ID
export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id),
    enabled: !!id,
  });
};

// FIXED: Fetches properties for the currently logged-in lister with better error handling
export const useListerProperties = () => {
  return useQuery({
    queryKey: ['lister-properties'],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        return propertyService.getPropertiesByOwner(user.userId);
      } catch (error) {
        console.error('Error fetching lister properties:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });
};

// Creates a new property
export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePropertyInput) => propertyService.createProperty(input),
    onSuccess: () => {
      // FIXED: Invalidate all relevant queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['lister-properties'] });
    },
  });
};

// Updates an existing property
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdatePropertyInput }) =>
      propertyService.updateProperty(id, updates),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['lister-properties'] });
    },
  });
};

// Deletes a property
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => propertyService.deleteProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['lister-properties'] });
    },
    onError: (error) => {
      console.error("Error deleting property:", error);
    }
  });
};

// Schedules a viewing for a property
export const useScheduleViewing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (viewingData: {
      propertyId: string;
      propertyOwnerId: string;
      message?: string;
      scheduledAt: string;
    }) => propertyService.scheduleViewing(viewingData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['viewings', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['lister-viewings', variables.propertyOwnerId] });
    }
  });
};

// Increments the view count of a property
export const useIncrementPropertyView = () => {
  return useMutation({
    mutationFn: (propertyId: string) => propertyService.incrementViews(propertyId),
  });
};

// --- USER PREFERENCE HOOKS ---

export const useUserPreferences = () => {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: async (): Promise<Schema['UserPreference']['type'] | null> => {
      try {
        const user = await getCurrentUser();
        const { data: preferences } = await client.models.UserPreference.list({
          filter: { userId: { eq: user.userId } },
        });

        if (preferences.length > 0) {
          return preferences[0];
        }

        const { data: newPreferences } = await client.models.UserPreference.create({
          userId: user.userId,
          catalogueProperties: [],
          favoriteProperties: [],
        });

        return newPreferences;
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useToggleCatalogue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const user = await getCurrentUser();
      
      // FIXED: Properly type the preferences data
      const currentPreferences = await queryClient.fetchQuery({
        queryKey: ['user-preferences'],
      }) as Schema['UserPreference']['type'] | null;

      const currentCatalogue = (currentPreferences?.catalogueProperties || []).filter((id): id is string => id !== null);
      const newCatalogue = currentCatalogue.includes(propertyId)
        ? currentCatalogue.filter((id: string) => id !== propertyId)
        : [...currentCatalogue, propertyId];

      if (currentPreferences?.id) {
        const { data } = await client.models.UserPreference.update({
          id: currentPreferences.id,
          catalogueProperties: newCatalogue.filter(Boolean),
        });
        return data;
      } else {
        const { data } = await client.models.UserPreference.create({
          userId: user.userId,
          catalogueProperties: newCatalogue.filter(Boolean),
        });
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
    onError: (error) => {
      console.error("Error toggling catalogue:", error);
    }
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: string) => {
      const user = await getCurrentUser();
      
      // FIXED: Properly type the preferences data
      const currentPreferences = await queryClient.fetchQuery({
        queryKey: ['user-preferences'],
      }) as Schema['UserPreference']['type'] | null;

      const currentFavorites = (currentPreferences?.favoriteProperties || []).filter((id): id is string => id !== null);
      const newFavorites = currentFavorites.includes(propertyId)
        ? currentFavorites.filter((id: string) => id !== propertyId)
        : [...currentFavorites, propertyId];

      if (currentPreferences?.id) {
        const { data } = await client.models.UserPreference.update({
          id: currentPreferences.id,
          favoriteProperties: newFavorites.filter(Boolean),
        });
        return data;
      } else {
        const { data } = await client.models.UserPreference.create({
          userId: user.userId,
          favoriteProperties: newFavorites.filter(Boolean),
        });
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
    onError: (error) => {
      console.error("Error toggling favorite:", error);
    }
  });
};

// NEW: Hook to fetch lister's viewings
export const useListerViewings = () => {
  return useQuery({
    queryKey: ['lister-viewings'],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        return propertyService.getListerViewings(user.userId); // Fetch by propertyOwnerId (which is lister's userId)
      } catch (error) {
        console.error('Error fetching lister viewings:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};

// NEW: Mutation to update viewing status
export const useUpdateViewing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: 'scheduled' | 'completed' | 'cancelled'; notes?: string }) =>
      propertyService.updateViewingStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lister-viewings'] });
    },
    onError: (error) => {
      console.error("Error updating viewing:", error);
    }
  });
};
