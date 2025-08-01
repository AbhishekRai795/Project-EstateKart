import React from 'react';
import { Calendar, User, MessageSquare, Check, X } from 'lucide-react';

// FIXED: Define the viewing type that exactly matches your database structure
interface EnrichedViewing {
  id: string;
  propertyId: string;
  userId: string;
  propertyOwnerId: string;
  message?: string | null;
  scheduledAt: string;
  status?: 'scheduled' | 'completed' | 'cancelled' | null | undefined;
  property?: {
    id: string;
    title: string;
    imageUrls?: string[];
    [key: string]: any;
  } | null;
  user?: {
    id: string;
    name: string;
    username?: string | null; // FIXED: Allow null as well as undefined
    properties?: any; // FIXED: Allow the properties function from LazyLoader
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  } | null;
  [key: string]: any;
}

interface ClientListProps {
  viewings: EnrichedViewing[];
  onUpdateStatus: (id: string, status: 'completed' | 'cancelled', notes?: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ viewings, onUpdateStatus }) => {
  if (viewings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No viewings found</h3>
        <p className="text-slate-600">No viewings match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Property
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Date/Time
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {viewings.map((viewing: EnrichedViewing) => {
            const status = viewing.status || 'scheduled';
            
            return (
              <tr key={viewing.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">
                    {viewing.property?.title || 'N/A'}
                  </div>
                  {viewing.property?.imageUrls?.[0] && (
                    <img 
                      src={viewing.property.imageUrls[0]} 
                      alt="Property" 
                      className="w-12 h-8 object-cover rounded mt-1"
                    />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {/* FIXED: Handle nullable username properly */}
                        {viewing.user?.name || viewing.user?.username || 'Anonymous'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900">
                        {new Date(viewing.scheduledAt).toLocaleDateString()}
                      </div>
                      <div className="text-slate-500">
                        {new Date(viewing.scheduledAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <MessageSquare className="h-4 w-4 mr-2 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700 line-clamp-2">
                      {viewing.message || 'No message provided'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    status === 'scheduled' 
                      ? 'bg-amber-100 text-amber-800'
                      : status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {status === 'scheduled' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateStatus(viewing.id, 'completed')}
                        className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Mark as Completed"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onUpdateStatus(viewing.id, 'cancelled')}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel Viewing"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {status !== 'scheduled' && (
                    <span className="text-slate-400 text-sm">No actions available</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
