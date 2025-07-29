import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService, CreatePropertyInput } from '../services/propertyService';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

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

export const useScheduleViewing = () => {
  return useMutation({
    mutationFn: propertyService.scheduleViewing,
  });
};

// Catalogue hooks with proper null handling
export const useUserPreferences = () => {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        const { data } = await client.models.UserPreference.list({
          filter: { userId: { eq: user.userId } }
        });
        
        if (data.length > 0) {
          return {
            ...data[0],
            // Filter out null values from arrays
            catalogueProperties: data[0].catalogueProperties?.filter((item): item is string => item !== null && item !== undefined) || [],
            favoriteProperties: data[0].favoriteProperties?.filter((item): item is string => item !== null && item !== undefined) || [],
            searchHistory: data[0].searchHistory?.filter((item): item is string => item !== null && item !== undefined) || [],
            preferredLocations: data[0].preferredLocations?.filter((item): item is string => item !== null && item !== undefined) || []
          };
        }
        
        // Create default preferences if none exist
        const { data: newPrefs } = await client.models.UserPreference.create({
          userId: user.userId,
          catalogueProperties: [],
          favoriteProperties: [],
          searchHistory: [],
          priceRange: { min: 0, max: 10000000 },
          preferredLocations: []
        });
        
        return {
          ...newPrefs,
          catalogueProperties: [],
          favoriteProperties: [],
          searchHistory: [],
          preferredLocations: []
        };
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        return {
          catalogueProperties: [],
          favoriteProperties: [],
          searchHistory: [],
          preferredLocations: [],
          priceRange: { min: 0, max: 10000000 }
        };
      }
    },
  });
};

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      catalogueProperties?: string[];
      favoriteProperties?: string[];
      searchHistory?: string[];
      priceRange?: any;
      preferredLocations?: string[];
    }) => {
      const user = await getCurrentUser();
      
      // Get existing preferences
      const { data: existing } = await client.models.UserPreference.list({
        filter: { userId: { eq: user.userId } }
      });
      
      if (existing.length > 0) {
        // Update existing - ensure arrays contain only strings
        return await client.models.UserPreference.update({
          id: existing[0].id,
          catalogueProperties: updates.catalogueProperties?.filter(Boolean) || existing[0].catalogueProperties?.filter(Boolean) || [],
          favoriteProperties: updates.favoriteProperties?.filter(Boolean) || existing[0].favoriteProperties?.filter(Boolean) || [],
          searchHistory: updates.searchHistory?.filter(Boolean) || existing[0].searchHistory?.filter(Boolean) || [],
          priceRange: updates.priceRange || existing[0].priceRange,
          preferredLocations: updates.preferredLocations?.filter(Boolean) || existing[0].preferredLocations?.filter(Boolean) || []
        });
      } else {
        // Create new - ensure arrays contain only strings
        return await client.models.UserPreference.create({
          userId: user.userId,
          catalogueProperties: updates.catalogueProperties?.filter(Boolean) || [],
          favoriteProperties: updates.favoriteProperties?.filter(Boolean) || [],
          searchHistory: updates.searchHistory?.filter(Boolean) || [],
          priceRange: updates.priceRange || { min: 0, max: 10000000 },
          preferredLocations: updates.preferredLocations?.filter(Boolean) || []
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });
};

// Catalogue-specific hooks with proper typing
export const useCatalogue = () => {
  const { data: preferences } = useUserPreferences();
  return {
    catalogueProperties: preferences?.catalogueProperties || [],
    favoriteProperties: preferences?.favoriteProperties || []
  };
};

export const useToggleCatalogue = () => {
  const updatePreferences = useUpdateUserPreferences();
  const { data: preferences } = useUserPreferences();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      const currentCatalogue = preferences?.catalogueProperties || [];
      const newCatalogue = currentCatalogue.includes(propertyId)
        ? currentCatalogue.filter(id => id !== propertyId)
        : [...currentCatalogue, propertyId];
      
      return updatePreferences.mutateAsync({
        catalogueProperties: newCatalogue.filter(Boolean)
      });
    },
    // Immediate cache invalidation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    }
  });
};

export const useToggleFavorite = () => {
  const updatePreferences = useUpdateUserPreferences();
  const { data: preferences } = useUserPreferences();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      const currentFavorites = preferences?.favoriteProperties || [];
      const newFavorites = currentFavorites.includes(propertyId)
        ? currentFavorites.filter(id => id !== propertyId)
        : [...currentFavorites, propertyId];
      
      return updatePreferences.mutateAsync({
        favoriteProperties: newFavorites.filter(Boolean)
      });
    },
    // Immediate cache invalidation
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    }
  });
};
