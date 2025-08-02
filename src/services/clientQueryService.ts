import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export interface ClientQuery {
  id: string;
  propertyId: string;
  userId: string;
  propertyOwnerId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
  property?: {
    id: string;
    title: string;
    location: string;
    price: number;
  };
  user?: {
    id: string;
    username: string;
  };
}

export interface CreateClientQueryInput {
  propertyId: string;
  propertyOwnerId: string;
  userId: string; // Added this field
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
}

// Create a new client query
export const createClientQuery = async (input: CreateClientQueryInput) => {
  try {
    const result = await client.models.ClientQuery.create({
      propertyId: input.propertyId,
      propertyOwnerId: input.propertyOwnerId,
      userId: input.userId, // Include userId explicitly
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      subject: input.subject,
      message: input.message,
      status: 'unread' as const,
      priority: input.priority || 'medium' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return result;
  } catch (error) {
    console.error('Error creating client query:', error);
    throw new Error('Failed to send your message. Please try again.');
  }
};

// Get all queries received by a property owner
export const getReceivedQueries = async (propertyOwnerId: string) => {
  try {
    const result = await client.models.ClientQuery.list({
      filter: {
        propertyOwnerId: {
          eq: propertyOwnerId
        }
      }
      // Removed sortDirection - not supported directly
    });
    
    // Sort manually by createdAt in descending order
    const sortedData = result.data.sort((a, b) => 
      new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    );
    
    return sortedData;
  } catch (error) {
    console.error('Error fetching received queries:', error);
    throw new Error('Failed to load client queries.');
  }
};

// Get all queries sent by a user
export const getSentQueries = async (userId: string) => {
  try {
    const result = await client.models.ClientQuery.list({
      filter: {
        userId: {
          eq: userId
        }
      }
      // Removed sortDirection - not supported directly
    });
    
    // Sort manually by createdAt in descending order
    const sortedData = result.data.sort((a, b) => 
      new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    );
    
    return sortedData;
  } catch (error) {
    console.error('Error fetching sent queries:', error);
    throw new Error('Failed to load your queries.');
  }
};

// Update query status (mark as read/replied)
export const updateQueryStatus = async (queryId: string, status: 'unread' | 'read' | 'replied') => {
  try {
    const result = await client.models.ClientQuery.update({
      id: queryId,
      status,
      updatedAt: new Date().toISOString(),
    });
    
    return result;
  } catch (error) {
    console.error('Error updating query status:', error);
    throw new Error('Failed to update query status.');
  }
};

// Delete a client query
export const deleteClientQuery = async (queryId: string) => {
  try {
    const result = await client.models.ClientQuery.delete({
      id: queryId
    });
    
    return result;
  } catch (error) {
    console.error('Error deleting client query:', error);
    throw new Error('Failed to delete query.');
  }
};

// Get query statistics for dashboard
export const getQueryStats = async (propertyOwnerId: string) => {
  try {
    const queries = await getReceivedQueries(propertyOwnerId);
    
    const stats = {
      total: queries.length,
      unread: queries.filter(q => q.status === 'unread').length,
      read: queries.filter(q => q.status === 'read').length,
      replied: queries.filter(q => q.status === 'replied').length,
      highPriority: queries.filter(q => q.priority === 'high').length,
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting query stats:', error);
    throw new Error('Failed to load statistics.');
  }
};
