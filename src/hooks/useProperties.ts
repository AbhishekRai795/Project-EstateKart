import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService, CreatePropertyInput } from '../services/propertyService';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import UserPreferenceService from '../services/userPreferenceService';

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

// Central hook for managing user preferences
export const useUserPreferences = () => {
  return useQuery({
    queryKey: ['user-preferences'],
    queryFn: UserPreferenceService.getUserPreferences,
  });
};

// Hook to toggle a property in the user's catalogue
export const useToggleCatalogue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => UserPreferenceService.toggleCatalogue(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });
};

// Hook to toggle a property in the user's favorites
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => UserPreferenceService.toggleFavorite(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });
};