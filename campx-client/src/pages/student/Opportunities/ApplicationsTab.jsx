import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import OpportunityCard from '../../../components/opportunities/OpportunityCard';
import OpportunityDetailsDrawer from '../../../components/opportunities/OpportunityDetailsDrawer';
import toast from 'react-hot-toast';
import { FileQuestion } from 'lucide-react';

const ApplicationsTab = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOp, setSelectedOp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/opportunities?applied=true'); // Mock param
      setApps(data.data || []);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-gray-100 animate-pulse rounded-xl border border-gray-200"></div>
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-purple-50 p-4 rounded-full mb-4">
            <FileQuestion size={48} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-500 max-w-md">You haven't applied to any drives. Start applying to opportunities and track your status here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map(op => (
            <OpportunityCard 
              key={op._id} 
              opportunity={op}
              isSaved={op.isSaved}
              applicationStatus={op.applicationStatus}
              onSave={() => {}}
              onApply={() => {}}
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
        onApply={() => {}}
      />
    </div>
  );
};

export default ApplicationsTab;
