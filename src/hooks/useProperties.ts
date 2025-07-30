import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService, CreatePropertyInput } from '../services/propertyService';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

// --- CORE PROPERTY HOOKS ---
export const useProperties = () => {
  return useQuery({
    queryKey: ['properties'],
    queryFn: propertyService.getAllProperties,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id),
    enabled: !!id,
  });
};

export const useListerProperties = () => {
  return useQuery({
    queryKey: ['lister-properties'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return propertyService.getPropertiesByLister(user.userId);
    },
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePropertyInput) => propertyService.createProperty(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['lister-properties'] });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreatePropertyInput> }) =>
      propertyService.updateProperty(id, updates),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['lister-properties'] });
    },
  });
};

// NEW: Mutation hook for deleting a property
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (propertyId: string) => propertyService.deleteProperty(propertyId),
    onSuccess: () => {
      // Invalidate both general and lister-specific queries to ensure UI consistency
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['lister-properties'] });
    },
    onError: (error) => {
      console.error("Error deleting property:", error);
      // You could add a user-facing notification here
    }
  });
};


export const useScheduleViewing = () => {
  return useMutation({
    mutationFn: propertyService.scheduleViewing,
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
      
      const currentPreferences = await queryClient.fetchQuery<Schema['UserPreference']['type'] | null>({
        queryKey: ['user-preferences'],
      });

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
      
      const currentPreferences = await queryClient.fetchQuery<Schema['UserPreference']['type'] | null>({
        queryKey: ['user-preferences'],
      });
      
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
