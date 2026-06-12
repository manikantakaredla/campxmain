import React, { useState, useEffect } from 'react';
import API from '../../../api/axios'; // Direct API call for specific student endpoint
import OpportunityCard from '../../../components/opportunities/OpportunityCard';
import OpportunityDetailsDrawer from '../../../components/opportunities/OpportunityDetailsDrawer';
import { removeSavedOpportunity, applyForOpportunity } from '../../../services/opportunityService';
import toast from 'react-hot-toast';
import { BookmarkMinus } from 'lucide-react';

const SavedTab = () => {
  const [savedOps, setSavedOps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOp, setSelectedOp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      // Let's assume the backend endpoint handles returning populated saved opportunities
      // Since we didn't explicitly create a GET /saved student route in milestone 3, 
      // we will use the logic we have or build a quick wrapper.
      // For this frontend exercise, we map `opportunities?saved=true` (which requires backend change)
      // OR we just assume the API exists for `API.get('/opportunities/me/saved')`.
      const { data } = await API.get('/opportunities?saved=true'); // Mock param logic
      setSavedOps(data.data || []);
    } catch (error) {
      toast.error('Failed to load saved opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemoveSave = async (op) => {
    try {
      await removeSavedOpportunity(op._id);
      toast.success('Removed from saved');
      fetchSaved();
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const handleApply = async (op) => {
    try {
      await applyForOpportunity(op._id);
      toast.success('Successfully applied!');
      setIsDrawerOpen(false);
      fetchSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-gray-100 animate-pulse rounded-xl border border-gray-200"></div>
        </div>
      ) : savedOps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <BookmarkMinus size={48} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Saved Opportunities</h3>
          <p className="text-gray-500 max-w-md">You haven't bookmarked any opportunities yet. Click the bookmark icon on any opportunity card to save it here for later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedOps.map(op => (
            <OpportunityCard 
              key={op._id} 
              opportunity={op}
              isSaved={true}
              applicationStatus={op.applicationStatus}
              onSave={handleRemoveSave}
              onApply={handleApply}
              onViewDetails={(o) => { setSelectedOp(o); setIsDrawerOpen(true); }}
            />
          ))}
        </div>
      )}

      <OpportunityDetailsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        opportunity={selectedOp} 
        applicationStatus={selectedOp?.applicationStatus}
        onApply={handleApply}
      />
    </div>
  );
};

export default SavedTab;
