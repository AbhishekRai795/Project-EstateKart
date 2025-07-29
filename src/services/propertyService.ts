import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';

const client = generateClient<Schema>();



export interface CreatePropertyInput {
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'house' | 'apartment' | 'condo' | 'villa';
  bedrooms: number;
  bathrooms: number;
  area: number;
  features: string[];
  images: File[];
  listerName: string;
  listerEmail: string;
  listerPhone: string;
}

export const propertyService = {
  // Create a new property - FIXED S3 UPLOAD PATHS AND ERROR HANDLING
  async createProperty(input: CreatePropertyInput) {
    try {
      const user = await getCurrentUser();
      const propertyId = crypto.randomUUID();
      
      // Upload images to S3 - FIXED PATH ISSUE
      const imageKeys: string[] = [];
      for (let i = 0; i < input.images.length; i++) {
        const file = input.images[i];
        const fileExtension = file.name.split('.').pop() || 'jpg';
        
        // FIXED: Remove 'public/' prefix - Amplify adds it automatically
        // This prevents the double "public/public/" path issue
        const key = `properties/${propertyId}/${i}-${Date.now()}.${fileExtension}`;
        
        try {
          const result = await uploadData({
            key, // This becomes 'public/properties/...' automatically
            data: file,
            options: {
              contentType: file.type,
              useAccelerateEndpoint: false,
            },
          }).result;
          
          imageKeys.push(result.key);
        } catch (uploadError) {
          console.error(`Error uploading image ${i}:`, uploadError);
          throw new Error(`Failed to upload image ${file.name}. Please check your permissions and try again.`);
        }
      }

      // Create property record in DynamoDB
      const { data: property } = await client.models.Property.create({
        id: propertyId,
        title: input.title,
        description: input.description,
        price: input.price,
        location: input.location,
        type: input.type,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        area: input.area,
        features: input.features,
        images: imageKeys, // Store the S3 keys
        listerId: user.userId,
        listerName: input.listerName,
        listerEmail: input.listerEmail,
        listerPhone: input.listerPhone,
        status: 'available',
        views: 0,
        createdAt: new Date().toISOString(),
      });

      return property;
    } catch (error: any) {
      console.error('Error creating property:', error);
      
      // Enhanced error handling for S3 and DynamoDB errors
      if (error.message?.includes('AccessDenied') || error.message?.includes('s3:PutObject')) {
        throw new Error('Upload failed: You don\'t have permission to upload images. Please contact support.');
      } else if (error.message?.includes('ValidationException')) {
        throw new Error('Invalid property data. Please check all required fields.');
      } else {
        throw new Error(error.message || 'Failed to create property. Please try again.');
      }
    }
  },


  // Add these methods to your existing propertyService object

// ADDED: Catalogue-related methods
async getUserPreferences(userId: string) {
  try {
    const { data } = await client.models.UserPreference.list({
      filter: { userId: { eq: userId } }
    });
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw new Error('Failed to load user preferences.');
  }
},

async updateUserPreferences(userId: string, updates: any) {
  try {
    const existing = await this.getUserPreferences(userId);
    
    if (existing) {
      const { data } = await client.models.UserPreference.update({
        id: existing.id,
        ...updates
      });
      return data;
    } else {
      const { data } = await client.models.UserPreference.create({
        userId,
        catalogueProperties: [],
        favoriteProperties: [],
        searchHistory: [],
        priceRange: { min: 0, max: 10000000 },
        preferredLocations: [],
        ...updates
      });
      return data;
    }
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error('Failed to update user preferences.');
  }
},

async toggleCatalogue(userId: string, propertyId: string) {
  try {
    const preferences = await this.getUserPreferences(userId);
    const currentCatalogue = preferences?.catalogueProperties || [];
    
    const newCatalogue = currentCatalogue.includes(propertyId)
      ? currentCatalogue.filter(id => id !== propertyId)
      : [...currentCatalogue, propertyId];
    
    return await this.updateUserPreferences(userId, {
      catalogueProperties: newCatalogue
    });
  } catch (error) {
    console.error('Error toggling catalogue:', error);
    throw new Error('Failed to update catalogue.');
  }
},

async toggleFavorite(userId: string, propertyId: string) {
  try {
    const preferences = await this.getUserPreferences(userId);
    const currentFavorites = preferences?.favoriteProperties || [];
    
    const newFavorites = currentFavorites.includes(propertyId)
      ? currentFavorites.filter(id => id !== propertyId)
      : [...currentFavorites, propertyId];
    
    return await this.updateUserPreferences(userId, {
      favoriteProperties: newFavorites
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new Error('Failed to update favorites.');
  }
},

  // Get all properties (for browsing) - FIXED NULL HANDLING
  async getAllProperties() {
    try {
      const { data: properties } = await client.models.Property.list({
        filter: {
          status: { eq: 'available' }
        }
      });
      
      // Get signed URLs for images - FIXED NULL HANDLING
      const propertiesWithImages = await Promise.all(
        properties.map(async (property) => {
          const imageUrls = await Promise.all(
            (property.images || [])
              .filter((key): key is string => key !== null && key !== undefined)
              .map(async (key: string) => {
                try {
                  const { url } = await getUrl({ key });
                  return url.toString();
                } catch (error) {
                  console.warn(`Failed to get URL for image key: ${key}`, error);
                  return null;
                }
              })
          );
          
          return {
            ...property,
            imageUrls: imageUrls.filter(Boolean), // Remove null URLs
          };
        })
      );

      return propertiesWithImages;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Failed to load properties. Please try again.');
    }
  },

  // Get properties by lister - FIXED NULL HANDLING
  async getPropertiesByLister(listerId: string) {
    try {
      const { data: properties } = await client.models.Property.listPropertiesByLister({
        listerId,
      });

      const propertiesWithImages = await Promise.all(
        properties.map(async (property) => {
          const imageUrls = await Promise.all(
            (property.images || [])
              .filter((key): key is string => key !== null && key !== undefined)
              .map(async (key: string) => {
                try {
                  const { url } = await getUrl({ key });
                  return url.toString();
                } catch (error) {
                  console.warn(`Failed to get URL for image key: ${key}`, error);
                  return null;
                }
              })
          );
          
          return {
            ...property,
            imageUrls: imageUrls.filter(Boolean),
          };
        })
      );

      return propertiesWithImages;
    } catch (error) {
      console.error('Error fetching lister properties:', error);
      throw new Error('Failed to load your properties. Please try again.');
    }
  },

  // Get single property - FIXED NULL HANDLING
  async getProperty(id: string) {
    try {
      const { data: property } = await client.models.Property.get({ id });
      
      if (!property) return null;

      const imageUrls = await Promise.all(
        (property.images || [])
          .filter((key): key is string => key !== null && key !== undefined)
          .map(async (key: string) => {
            try {
              const { url } = await getUrl({ key });
              return url.toString();
            } catch (error) {
              console.warn(`Failed to get URL for image key: ${key}`, error);
              return null;
            }
          })
      );

      return {
        ...property,
        imageUrls: imageUrls.filter(Boolean),
      };
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Failed to load property details. Please try again.');
    }
  },

  // Update property - FIXED TO EXCLUDE IMAGES FROM UPDATES
  async updateProperty(id: string, updates: Omit<Partial<CreatePropertyInput>, 'images'>) {
    try {
      const { data: property } = await client.models.Property.update({
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      return property;
    } catch (error) {
      console.error('Error updating property:', error);
      throw new Error('Failed to update property. Please try again.');
    }
  },

  // Delete property - FIXED NULL HANDLING AND S3 CLEANUP
  async deleteProperty(id: string) {
    try {
      // First get the property to access image keys
      const { data: property } = await client.models.Property.get({ id });
      
      if (property?.images) {
        // Delete images from S3 - FIXED NULL HANDLING
        await Promise.all(
          property.images
            .filter((key): key is string => key !== null && key !== undefined)
            .map(async (key: string) => {
              try {
                await remove({ key });
              } catch (error) {
                console.warn(`Failed to delete image with key: ${key}`, error);
                // Continue with property deletion even if image deletion fails
              }
            })
        );
      }

      // Delete property record
      await client.models.Property.delete({ id });
    } catch (error) {
      console.error('Error deleting property:', error);
      throw new Error('Failed to delete property. Please try again.');
    }
  },

  // Increment property views
  async incrementViews(id: string) {
    try {
      const { data: property } = await client.models.Property.get({ id });
      if (property) {
        await client.models.Property.update({
          id,
          views: (property.views || 0) + 1,
        });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Don't throw error for view tracking failures
    }
  },

  // Schedule viewing
  async scheduleViewing(viewingData: {
    propertyId: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    date: string;
    time: string;
    message?: string;
    listerId: string;
  }) {
    try {
      const { data: viewing } = await client.models.PropertyViewing.create({
        ...viewingData,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      });

      return viewing;
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      throw new Error('Failed to schedule viewing. Please try again.');
    }
  },

  // Get viewings for a property
  async getPropertyViewings(propertyId: string) {
    try {
      const { data: viewings } = await client.models.PropertyViewing.list({
        filter: {
          propertyId: { eq: propertyId }
        }
      });

      return viewings;
    } catch (error) {
      console.error('Error fetching viewings:', error);
      throw new Error('Failed to load viewing schedule.');
    }
  },

  // Get viewings for a lister
  async getListerViewings(listerId: string) {
    try {
      const { data: viewings } = await client.models.PropertyViewing.list({
        filter: {
          listerId: { eq: listerId }
        }
      });

      return viewings;
    } catch (error) {
      console.error('Error fetching lister viewings:', error);
      throw new Error('Failed to load your viewing schedule.');
    }
  },
};
