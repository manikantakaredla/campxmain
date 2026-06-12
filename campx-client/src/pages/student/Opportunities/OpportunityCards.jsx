import React, { useState, useEffect } from 'react';
import OpportunityCard from '../../../components/opportunities/OpportunityCard';
import OpportunityFilters from '../../../components/opportunities/OpportunityFilters';
import OpportunityDetailsDrawer from '../../../components/opportunities/OpportunityDetailsDrawer';
import { getOpportunities, saveOpportunity, removeSavedOpportunity, applyForOpportunity } from '../../../services/opportunityService';
import toast from 'react-hot-toast';
import { Inbox } from 'lucide-react';

const OpportunityCards = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOp, setSelectedOp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await getOpportunities({ search, type, status, limit: 50 });
      if (res.success) setOpportunities(res.data);
    } catch (error) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [search, type, status]);

  const handleSave = async (op) => {
    try {
      if (op.isSaved) {
        await removeSavedOpportunity(op._id);
        toast.success('Removed from saved');
      } else {
        await saveOpportunity(op._id);
        toast.success('Opportunity saved');
      }
      fetchOpportunities(); // Re-fetch to update state
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleApply = async (op) => {
    try {
      await applyForOpportunity(op._id);
      toast.success('Successfully applied!');
      setIsDrawerOpen(false);
      fetchOpportunities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  };

  const handleViewDetails = (op) => {
    setSelectedOp(op);
    setIsDrawerOpen(true);
  };

  return (
    <div>
      <OpportunityFilters onSearchChange={setSearch} onTypeChange={setType} onStatusChange={setStatus} />
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-xl border border-gray-200"></div>
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Inbox size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Opportunities Found</h3>
          <p className="text-gray-500 max-w-md">There are currently no active opportunities matching your filters. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map(op => (
            <OpportunityCard 
              key={op._id} 
              opportunity={op}
              isSaved={op.isSaved}
              applicationStatus={op.applicationStatus}
              onSave={handleSave}
              onApply={handleApply}
              onViewDetails={handleViewDetails}
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

export default OpportunityCards;
