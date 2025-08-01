import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../../amplify/data/resource';
import { useAuth } from './AuthContext';

const client = generateClient<Schema>();

// FIXED: Updated Property interface to match backend schema exactly
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type?: 'house' | 'apartment' | 'condo' | 'villa' | null;
  status?: 'available' | 'pending' | 'sold' | null;
  images?: (string | null)[] | null;
  imageUrls?: string[]; // FIXED: Added imageUrls for enriched properties
  ownerId: string;
  listerName?: string | null;
  listerEmail?: string | null;
  listerPhone?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  views?: number | null;
  features?: (string | null)[] | null;
}

interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  error: string | null; // FIXED: Added error state
  addProperty: (property: Omit<Property, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Omit<Property, 'id' | 'ownerId'>>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getPropertiesByLister: (listerId: string) => Property[];
  getPropertyAnalytics: (listerId: string) => any;
  catalogueProperties: string[];
  favorites: string[];
  toggleCatalogue: (propertyId: string) => void;
  toggleFavorite: (propertyId: string) => void;
  refreshProperties: () => Promise<void>; // FIXED: Added refresh function
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // FIXED: Added error state
  const [catalogueProperties, setCatalogueProperties] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // FIXED: Enhanced fetchProperties with proper error handling and auth fallback
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      let errors;

      // Try authenticated request first
      try {
        const result = await client.models.Property.list({
          authMode: 'userPool'
        });
        data = result.data;
        errors = result.errors;
      } catch (authError) {
        // Fallback to IAM for unauthenticated users
        console.log('Falling back to IAM auth mode');
        const result = await client.models.Property.list({
          authMode: 'iam'
        });
        data = result.data;
        errors = result.errors;
      }

      if (errors && errors.length > 0) {
        console.error('Error fetching properties:', errors);
        setError('Failed to load some properties');
      }

      if (data) {
        const fetchedProperties = data.map(p => ({
          ...p,
          images: p.images ?? [],
          imageUrls: [], // Will be populated by individual property components
        })) as Property[];

        setProperties(fetchedProperties);
      }
    } catch (e) {
      console.error('An exception occurred while fetching properties:', e);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // FIXED: Refresh function for manual updates
  const refreshProperties = useCallback(async () => {
    await fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // FIXED: Enhanced addProperty with better error handling
  const addProperty = async (propertyData: Omit<Property, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      throw new Error("User must be logged in to add a property.");
    }

    try {
      const { data: newProperty, errors } = await client.models.Property.create({
        ...propertyData,
        ownerId: user.id,
        views: 0,
        images: propertyData.images || [],
        features: propertyData.features || [],
      });

      if (errors && errors.length > 0) {
        console.error('Error creating property:', errors);
        throw new Error(errors.map(e => e.message).join('\n'));
      }

      if (newProperty) {
        setProperties(prev => [...prev, newProperty as Property]);
      }
    } catch (e) {
      console.error('An exception occurred while creating a property:', e);
      throw e;
    }
  };

  // FIXED: Enhanced updateProperty
  const updateProperty = async (id: string, updates: Partial<Omit<Property, 'id' | 'ownerId'>>) => {
    const originalProperty = properties.find(p => p.id === id);
    if (!originalProperty) {
      throw new Error("Property not found");
    }

    try {
      const { data: updatedProperty, errors } = await client.models.Property.update({
        id,
        ...updates
      });

      if (errors && errors.length > 0) {
        console.error('Error updating property:', errors);
        throw new Error(errors.map(e => e.message).join('\n'));
      }

      if (updatedProperty) {
        setProperties(prev => prev.map(p => (p.id === id ? { ...p, ...updatedProperty } : p)));
      }
    } catch (e) {
      console.error('An exception occurred while updating a property:', e);
      throw e;
    }
  };

  // Delete a property (unchanged)
  const deleteProperty = async (id: string) => {
    try {
      const { errors } = await client.models.Property.delete({ id });
      if (errors && errors.length > 0) {
        console.error('Error deleting property:', errors);
        throw new Error(errors.map(e => e.message).join('\n'));
      }

      setProperties(prev => prev.filter(property => property.id !== id));
    } catch (e) {
      console.error('An exception occurred while deleting a property:', e);
      throw e;
    }
  };

  // Toggle functions (unchanged)
  const toggleCatalogue = (propertyId: string) => {
    setCatalogueProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const getPropertiesByLister = (listerId: string) => {
    return properties.filter(property => property.ownerId === listerId);
  };

  const getPropertyAnalytics = (listerId: string) => {
    const listerProperties = getPropertiesByLister(listerId);
    const totalViews = listerProperties.reduce((sum, prop) => sum + (prop.views || 0), 0);

    return {
      totalProperties: listerProperties.length,
      totalViews,
      totalOffers: 0,
      conversionRate: 'N/A',
      averagePrice: listerProperties.length > 0
        ? Math.round(listerProperties.reduce((sum, prop) => sum + prop.price, 0) / listerProperties.length)
        : 0,
      propertiesByStatus: {
        available: listerProperties.filter(p => p.status === 'available').length,
        pending: listerProperties.filter(p => p.status === 'pending').length,
        sold: listerProperties.filter(p => p.status === 'sold').length
      }
    };
  };

  return (
    <PropertyContext.Provider value={{
      properties,
      loading,
      error,
      addProperty,
      updateProperty,
      deleteProperty,
      getPropertiesByLister,
      getPropertyAnalytics,
      catalogueProperties,
      favorites,
      toggleCatalogue,
      toggleFavorite,
      refreshProperties,
    }}>
      {children}
    </PropertyContext.Provider>
  );
};
