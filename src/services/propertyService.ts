import { generateClient } from 'aws-amplify/api';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';

const client = generateClient<Schema>();

// This interface defines the shape of data for creating a property.
export interface CreatePropertyInput {
  title: string;
  description: string;
  price: number;
  location: string;
  type: 'house' | 'apartment' | 'condo' | 'villa';
  bedrooms: number;
  bathrooms: number;
  area: number;
  features?: (string | null)[] | null;
  images: File[];
  listerName?: string | null;
  listerEmail?: string | null;
  listerPhone?: string | null;
}

// This interface defines the shape for updating a property.
export type UpdatePropertyInput = Partial<Omit<CreatePropertyInput, 'images'>> & {
  images?: string[];
};

// Helper function to enrich a property with signed image URLs
const enrichPropertyWithImageUrls = async (property: Schema['Property']['type']) => {
  const imageUrls = await Promise.all(
    (property.images || []).filter(key => !!key).map(async (key) => {
      try {
        const { url } = await getUrl({ key: key!, options: { validateObjectExistence: true, expiresIn: 60 } });
        return url.toString();
      } catch (e) {
        console.warn(`Failed to get URL for key: ${key}`, e);
        return null;
      }
    })
  );

  return {
    ...property,
    imageUrls: imageUrls.filter((url): url is string => !!url),
  };
};

// FIXED: Properly call lazy-loading functions for related models
// AFTER (fixed):
const enrichViewing = async (viewing: Schema['PropertyViewing']['type']) => {
  const [property, user] = await Promise.all([
    viewing.propertyId ? client.models.Property.get({ id: viewing.propertyId }) : Promise.resolve(null),
    viewing.userId ? client.models.User.get({ id: viewing.userId }) : Promise.resolve(null),
  ]);

  return {
    ...viewing,
    property: property?.data ? await enrichPropertyWithImageUrls(property.data) : null,
    user: user?.data ? { ...user.data, name: user.data.username || 'Anonymous' } : null,
  };
};

export const propertyService = {
  // --- CORE PROPERTY CRUD ---
  async getAllProperties() {
    try {
      // FIXED: Using 'userPool' auth mode for authenticated users, fallback to 'iam' for guests
      const { data: properties } = await client.models.Property.list({
        authMode: 'userPool'
      });

      // FIXED: Enrich all properties with image URLs for consistency
      return Promise.all(properties.map(enrichPropertyWithImageUrls));
    } catch (error) {
      console.error('Error fetching all properties:', error);
      
      // FIXED: Fallback to IAM auth mode if user pools fail (for unauthenticated users)
      try {
        const { data: properties } = await client.models.Property.list({
          authMode: 'iam'
        });
        return Promise.all(properties.map(enrichPropertyWithImageUrls));
      } catch (fallbackError) {
        console.error('Error with fallback auth:', fallbackError);
        throw new Error('Failed to load properties.');
      }
    }
  },

  async getProperty(id: string) {
    try {
      // FIXED: Try authenticated first, then fallback - remove authMode from get options
      let property;
      try {
        const result = await client.models.Property.get({ id });
        property = result.data;
      } catch {
        const result = await client.models.Property.get({ id });
        property = result.data;
      }

      if (!property) return null;
      // Uses the helper to enrich the single property
      return enrichPropertyWithImageUrls(property);
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Failed to load property details.');
    }
  },

  async createProperty(input: CreatePropertyInput) {
    const user = await getCurrentUser();
    const propertyId = crypto.randomUUID();

    const imageKeys = await Promise.all(
      input.images.map(async (file) => {
        const extension = file.name.split('.').pop() || 'file';
        const key = `properties/${propertyId}/${Date.now()}.${extension}`;
        await uploadData({ key, data: file }).result;
        return key;
      })
    );

    // FIXED: Remove images from the spread and add them separately as strings
    const { images: _, ...inputWithoutImages } = input;

    const { data: newProperty } = await client.models.Property.create({
      id: propertyId,
      ownerId: user.userId,
      ...inputWithoutImages,
      price: Number(input.price),
      bedrooms: Number(input.bedrooms),
      bathrooms: Number(input.bathrooms),
      area: Number(input.area),
      images: imageKeys, // FIXED: Now properly typed as string[]
      status: 'available',
      views: 0,
    });

    return newProperty;
  },

  async updateProperty(id: string, updates: UpdatePropertyInput) {
    const { data: updatedProperty } = await client.models.Property.update({
      id,
      ...updates,
    });
    return updatedProperty;
  },

  async deleteProperty(propertyId: string) {
    const { data: property } = await client.models.Property.get({ id: propertyId });
    if (property?.images) {
      await Promise.all(
        property.images.filter(key => !!key).map(key => remove({ key: key! }))
      );
    }

    await client.models.Property.delete({ id: propertyId });
  },

  // --- LISTER-SPECIFIC FUNCTIONS ---
  async getPropertiesByOwner(ownerId: string) {
    try {
      const { data: properties } = await client.models.Property.list({
        filter: { ownerId: { eq: ownerId } },
        authMode: 'userPool' // FIXED: Use proper auth mode for owner queries
      });

      // FIXED: Enrich all properties with image URLs for consistency
      return Promise.all(properties.map(enrichPropertyWithImageUrls));
    } catch (error) {
      console.error('Error fetching lister properties:', error);
      throw new Error('Failed to load your properties.');
    }
  },

  // --- VIEWING & ANALYTICS ---
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
    }
  },

  async scheduleViewing(viewingData: {
    propertyId: string;
    propertyOwnerId: string;
    message?: string;
    scheduledAt: string;
  }) {
    const user = await getCurrentUser();
    const { data: viewing } = await client.models.PropertyViewing.create({
      userId: user.userId,
      ...viewingData,
      status: 'scheduled',
    });
    return viewing;
  },

  async getListerViewings(propertyOwnerId: string) {
    try {
      const { data: viewings } = await client.models.PropertyViewing.list({
        filter: { propertyOwnerId: { eq: propertyOwnerId } },
      });
      // NEW: Enrich viewings with property and user details
      return Promise.all(viewings.map(enrichViewing));
    } catch (error) {
      console.error('Error fetching lister viewings:', error);
      throw new Error('Failed to load your viewing schedule.');
    }
  },

  // NEW: Method to update viewing status (e.g., approve/reject)
  async updateViewingStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled', notes?: string) {
    const { data: updatedViewing } = await client.models.PropertyViewing.update({
      id,
      status,
      message: notes, // Reuse message field for notes if needed
    });
    return updatedViewing;
  },
};
