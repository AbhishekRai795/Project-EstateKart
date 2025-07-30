import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export const useCatalogue = () => {
  const queryClient = useQueryClient();

  // Get user preferences with catalogue data
  const { data: preferences, isLoading, error, refetch } = useQuery({
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
            catalogueProperties: (data[0].catalogueProperties as string[])?.filter(
              (item): item is string => item !== null && item !== undefined
            ) || [],
            favoriteProperties: (data[0].favoriteProperties as string[])?.filter(
              (item): item is string => item !== null && item !== undefined
            ) || []
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
          catalogueProperties: [] as string[],
          favoriteProperties: [] as string[]
        };
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        return {
          catalogueProperties: [] as string[],
          favoriteProperties: [] as string[]
        };
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Toggle catalogue with optimistic updates
  const toggleCatalogue = useMutation({
    mutationFn: async (propertyId: string) => {
      const user = await getCurrentUser();
      const currentCatalogue = (preferences?.catalogueProperties as string[]) || [];
      const newCatalogue = currentCatalogue.includes(propertyId)
        ? currentCatalogue.filter(id => id !== propertyId)
        : [...currentCatalogue, propertyId];

      if (preferences?.id) {
        const { data } = await client.models.UserPreference.update({
          id: preferences.id,
          catalogueProperties: newCatalogue.filter(Boolean)
        });
        return data;
      } else {
        const { data } = await client.models.UserPreference.create({
          userId: user.userId,
          catalogueProperties: newCatalogue.filter(Boolean),
          favoriteProperties: [],
          searchHistory: [],
          priceRange: { min: 0, max: 10000000 },
          preferredLocations: []
        });
        return data;
      }
    },
    onMutate: async (propertyId: string) => {
      // Cancel outgoing queries to avoid optimistic update conflicts
      await queryClient.cancelQueries({ queryKey: ['user-preferences'] });
      
      // Get current data
      const previous = queryClient.getQueryData(['user-preferences']);
      
      // Optimistically update the cache
      queryClient.setQueryData(['user-preferences'], (old: any) => {
        if (!old) return old;
        
        const currentCatalogue = (old.catalogueProperties as string[]) || [];
        const newCatalogue = currentCatalogue.includes(propertyId)
          ? currentCatalogue.filter((id: string) => id !== propertyId)
          : [...currentCatalogue, propertyId];
        
        return { 
          ...old, 
          catalogueProperties: newCatalogue 
        };
      });

      return { previous };
    },
    onError: (err, _propertyId, context) => {
      console.error('Error toggling catalogue:', err);
      // Rollback optimistic update on error
      if (context?.previous) {
        queryClient.setQueryData(['user-preferences'], context.previous);
      }
    },
    onSettled: () => {
      // Always refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    }
  });

  // Toggle favorite with optimistic updates
  const toggleFavorite = useMutation({
    mutationFn: async (propertyId: string) => {
      const user = await getCurrentUser();
      const currentFavorites = (preferences?.favoriteProperties as string[]) || [];
      const newFavorites = currentFavorites.includes(propertyId)
        ? currentFavorites.filter(id => id !== propertyId)
        : [...currentFavorites, propertyId];

      if (preferences?.id) {
        const { data } = await client.models.UserPreference.update({
          id: preferences.id,
          favoriteProperties: newFavorites.filter(Boolean)
        });
        return data;
      } else {
        const { data } = await client.models.UserPreference.create({
          userId: user.userId,
          catalogueProperties: [],
          favoriteProperties: newFavorites.filter(Boolean),
          searchHistory: [],
          priceRange: { min: 0, max: 10000000 },
          preferredLocations: []
        });
        return data;
      }
    },
    onMutate: async (propertyId: string) => {
      await queryClient.cancelQueries({ queryKey: ['user-preferences'] });
      const previous = queryClient.getQueryData(['user-preferences']);
      
      queryClient.setQueryData(['user-preferences'], (old: any) => {
        if (!old) return old;
        
        const currentFavorites = (old.favoriteProperties as string[]) || [];
        const newFavorites = currentFavorites.includes(propertyId)
          ? currentFavorites.filter((id: string) => id !== propertyId)
          : [...currentFavorites, propertyId];
        
        return { 
          ...old, 
          favoriteProperties: newFavorites 
        };
      });

      return { previous };
    },
    onError: (err, _propertyId, context) => {
      console.error('Error toggling favorite:', err);
      if (context?.previous) {
        queryClient.setQueryData(['user-preferences'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    }
  });

  return {
    // Data
    catalogueProperties: (preferences?.catalogueProperties as string[]) || [],
    favoriteProperties: (preferences?.favoriteProperties as string[]) || [],
    catalogueCount: (preferences?.catalogueProperties as string[])?.length || 0,
    favoriteCount: (preferences?.favoriteProperties as string[])?.length || 0,
    preferences,
    
    // State
    isLoading,
    error,
    
    // Actions
    toggleCatalogue: toggleCatalogue.mutate,
    toggleFavorite: toggleFavorite.mutate,
    refetch,
    
    // Loading states for individual actions
    isTogglingCatalogue: toggleCatalogue.isPending,
    isTogglingFavorite: toggleFavorite.isPending,
    
    // Helper functions
    isCatalogued: (propertyId: string) => 
      ((preferences?.catalogueProperties as string[]) || []).includes(propertyId),
    isFavorite: (propertyId: string) => 
      ((preferences?.favoriteProperties as string[]) || []).includes(propertyId),
  };
};
