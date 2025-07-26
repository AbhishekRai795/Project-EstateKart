import React, { createContext, useContext, useState } from 'react';


export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: 'house' | 'apartment' | 'condo' | 'villa';
  status: 'available' | 'pending' | 'sold';
  images: string[];
  listerId: string;
  listerName: string;
  createdAt: Date;
  views: number;
  offers: number;
  coordinates?: { lat: number; lng: number };
}

interface PropertyContextType {
  properties: Property[];
  catalogueProperties: string[];
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'views' | 'offers'>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  toggleCatalogue: (propertyId: string) => void;
  getPropertiesByLister: (listerId: string) => Property[];
  getPropertyAnalytics: (listerId: string) => any;
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
  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      title: 'Modern Downtown Apartment',
      description: 'Beautiful modern apartment in the heart of downtown with stunning city views.',
      price: 450000,
      location: 'Downtown, New York',
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      type: 'apartment',
      status: 'available',
      images: [
        'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      listerId: 'lister1',
      listerName: 'John Smith Properties',
      createdAt: new Date('2024-01-15'),
      views: 245,
      offers: 8
    },
    {
      id: '2',
      title: 'Luxury Family Villa',
      description: 'Spacious family villa with garden, pool, and modern amenities.',
      price: 850000,
      location: 'Suburbs, California',
      bedrooms: 4,
      bathrooms: 3,
      area: 2800,
      type: 'villa',
      status: 'available',
      images: [
        'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      listerId: 'lister2',
      listerName: 'Premium Estates',
      createdAt: new Date('2024-01-20'),
      views: 189,
      offers: 12
    },
    {
      id: '3',
      title: 'Cozy Studio Apartment',
      description: 'Perfect starter home or investment property in a quiet neighborhood.',
      price: 220000,
      location: 'Brooklyn, New York',
      bedrooms: 1,
      bathrooms: 1,
      area: 600,
      type: 'apartment',
      status: 'pending',
      images: [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      listerId: 'lister1',
      listerName: 'John Smith Properties',
      createdAt: new Date('2024-01-25'),
      views: 156,
      offers: 5
    }
  ]);

  const [catalogueProperties, setCatalogueProperties] = useState<string[]>([]);

  const addProperty = (propertyData: Omit<Property, 'id' | 'createdAt' | 'views' | 'offers'>) => {
    const newProperty: Property = {
      ...propertyData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      views: 0,
      offers: 0
    };
    setProperties(prev => [...prev, newProperty]);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(property => 
      property.id === id ? { ...property, ...updates } : property
    ));
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(property => property.id !== id));
  };

  const toggleCatalogue = (propertyId: string) => {
    setCatalogueProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const getPropertiesByLister = (listerId: string) => {
    return properties.filter(property => property.listerId === listerId);
  };

  const getPropertyAnalytics = (listerId: string) => {
    const listerProperties = getPropertiesByLister(listerId);
    const totalViews = listerProperties.reduce((sum, prop) => sum + prop.views, 0);
    const totalOffers = listerProperties.reduce((sum, prop) => sum + prop.offers, 0);
    const conversionRate = totalViews > 0 ? (totalOffers / totalViews * 100).toFixed(2) : '0';
    
    return {
      totalProperties: listerProperties.length,
      totalViews,
      totalOffers,
      conversionRate,
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
      catalogueProperties,
      addProperty,
      updateProperty,
      deleteProperty,
      toggleCatalogue,
      getPropertiesByLister,
      getPropertyAnalytics
    }}>
      {children}
    </PropertyContext.Provider>
  );
};