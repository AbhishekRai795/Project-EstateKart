// ClientManagement.tsx - Add viewing actions
const useViewingActions = () => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const updateViewingStatus = useCallback(async (viewingId: string, newStatus: 'completed' | 'cancelled') => {
    setActionLoading(viewingId);
    try {
      const result = await client.models.PropertyViewing.update({
        id: viewingId,
        status: newStatus
      });
      
      // Update local state optimistically
      setViewings(prev => 
        prev.map(viewing => 
          viewing.id === viewingId 
            ? { ...viewing, status: newStatus }
            : viewing
        )
      );
      
      return result.data;
    } catch (error) {
      console.error('Error updating viewing status:', error);
      throw error;
    } finally {
      setActionLoading(null);
    }
  }, []);

  const acceptViewing = useCallback((id: string) => 
    updateViewingStatus(id, 'completed'), [updateViewingStatus]);
  
  const rejectViewing = useCallback((id: string) => 
    updateViewingStatus(id, 'cancelled'), [updateViewingStatus]);

  return { acceptViewing, rejectViewing, actionLoading };
};

// Add this to your viewing card JSX
const ViewingCard = ({ viewing }) => {
  const { acceptViewing, rejectViewing, actionLoading } = useViewingActions();
  
  return (
    <div className="viewing-card">
      {/* Your existing viewing card content */}
      
      {viewing.status === 'scheduled' && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => acceptViewing(viewing.id)}
            disabled={actionLoading === viewing.id}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading === viewing.id ? 'Processing...' : 'Accept'}
          </button>
          <button
            onClick={() => rejectViewing(viewing.id)}
            disabled={actionLoading === viewing.id}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading === viewing.id ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );
};
